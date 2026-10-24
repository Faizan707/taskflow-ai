"""
Tools = functions the AI can call.

Beginner tip:
- The LLM cannot talk to your database by itself.
- We give it small Python functions (tools).
- When the user asks something, the agent may call these tools.
"""

from datetime import datetime, timezone

from langchain.tools import tool
from sqlalchemy.orm import Session, joinedload

from models import KanbanStage, Project, Task, User

DEFAULT_STAGES = ["todo", "inprogress", "done"]


def _is_staff(user: User) -> bool:
    return user.role in ("admin", "manager")


def make_tools(db: Session, current_user: User):
    """
    Build tools for ONE request.

    Why a function?
    - Each chat request has its own db session + logged-in user.
    - Tools close over (remember) that db + user.
    """

    @tool
    def count_projects() -> str:
        """Count how many projects the current user can see."""
        query = db.query(Project)
        if not _is_staff(current_user):
            query = query.filter(Project.owner_id == current_user.id)
        total = query.count()
        return f"You can see {total} project(s)."

    @tool
    def list_projects() -> str:
        """List project names and ids for the current user."""
        query = db.query(Project)
        if not _is_staff(current_user):
            query = query.filter(Project.owner_id == current_user.id)
        projects = query.order_by(Project.id).all()
        if not projects:
            return "No projects found."
        lines = [f"- id={p.id}: {p.name}" for p in projects]
        return "Projects:\n" + "\n".join(lines)

    @tool
    def create_project(name: str, description: str = "") -> str:
        """
        Create a new project with default kanban stages (todo, inprogress, done).

        Args:
            name: Project name
            description: Optional short description
        """
        now = datetime.now(timezone.utc)
        project = Project(
            name=name.strip(),
            description=(description or "").strip(),
            owner_id=current_user.id,
            created_at=now,
            updated_at=now,
        )
        db.add(project)
        db.flush()

        for index, stage_name in enumerate(DEFAULT_STAGES):
            db.add(
                KanbanStage(
                    name=stage_name,
                    position=index,
                    project_id=project.id,
                )
            )

        db.commit()
        return (
            f"Created project '{project.name}' (id={project.id}) "
            f"with stages: todo, inprogress, done."
        )

    @tool
    def list_people() -> str:
        """List users (name, email, id) so tasks can be assigned."""
        people = db.query(User).order_by(User.id).all()
        if not people:
            return "No users found."
        lines = [f"- id={u.id}: {u.name} <{u.email}> role={u.role}" for u in people]
        return "People:\n" + "\n".join(lines)

    @tool
    def count_tasks(project_name: str = "") -> str:
        """
        Count tasks. Optionally filter by project name.

        Args:
            project_name: Optional project name filter (partial match ok)
        """
        query = db.query(Task)
        if not _is_staff(current_user):
            query = query.filter(
                (Task.assignee_id == current_user.id)
                | (Task.created_by_id == current_user.id)
            )

        if project_name.strip():
            project = (
                db.query(Project)
                .filter(Project.name.ilike(f"%{project_name.strip()}%"))
                .first()
            )
            if not project:
                return f"No project found matching '{project_name}'."
            query = query.filter(Task.project_id == project.id)
            total = query.count()
            return f"Project '{project.name}' has {total} task(s)."

        total = query.count()
        return f"You can see {total} task(s)."

    @tool
    def create_task(
        project_name: str,
        title: str,
        assignee_name_or_email: str = "",
        description: str = "",
        stage_name: str = "todo",
        priority: str = "medium",
    ) -> str:
        """
        Create a task inside a project and assign it to someone.

        Args:
            project_name: Existing project name (partial match ok)
            title: Task title
            assignee_name_or_email: Person name or email. Empty = assign to current user
            description: Optional task description
            stage_name: Stage name, default 'todo' (also: inprogress, done)
            priority: Task priority — low, medium, or high (default medium)
        """
        project = (
            db.query(Project)
            .options(joinedload(Project.stages))
            .filter(Project.name.ilike(f"%{project_name.strip()}%"))
            .first()
        )
        if not project:
            return f"No project found matching '{project_name}'."

        if not (_is_staff(current_user) or project.owner_id == current_user.id):
            return "You are not allowed to add tasks to this project."

        stage_key = stage_name.strip().lower().replace(" ", "")
        stage = next(
            (s for s in project.stages if s.name.lower().replace(" ", "") == stage_key),
            None,
        )
        if not stage:
            stage = next((s for s in project.stages if s.name.lower() == "todo"), None)
        if not stage:
            return "This project has no stages."

        assignee = current_user
        needle = assignee_name_or_email.strip()
        if needle:
            found = (
                db.query(User)
                .filter(
                    (User.name.ilike(f"%{needle}%")) | (User.email.ilike(f"%{needle}%"))
                )
                .first()
            )
            if not found:
                return f"No person found matching '{needle}'. Use list_people first."
            assignee = found

        priority_value = (priority or "medium").strip().lower()
        if priority_value not in {"low", "medium", "high"}:
            priority_value = "medium"

        now = datetime.now(timezone.utc)
        task = Task(
            title=title.strip(),
            description=(description or "").strip(),
            priority=priority_value,
            project_id=project.id,
            stage_id=stage.id,
            assignee_id=assignee.id,
            created_by_id=current_user.id,
            created_at=now,
            updated_at=now,
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        return (
            f"Created task '{task.title}' (id={task.id}) in project '{project.name}', "
            f"stage '{stage.name}', priority '{task.priority}', assigned to {assignee.name}."
        )

    @tool
    def assign_task(task_title: str, assignee_name_or_email: str) -> str:
        """
        Assign an existing task to a person by task title and person name/email.

        Args:
            task_title: Task title (partial match ok)
            assignee_name_or_email: Person name or email
        """
        task = (
            db.query(Task)
            .filter(Task.title.ilike(f"%{task_title.strip()}%"))
            .order_by(Task.id.desc())
            .first()
        )
        if not task:
            return f"No task found matching '{task_title}'."

        person = (
            db.query(User)
            .filter(
                (User.name.ilike(f"%{assignee_name_or_email.strip()}%"))
                | (User.email.ilike(f"%{assignee_name_or_email.strip()}%"))
            )
            .first()
        )
        if not person:
            return f"No person found matching '{assignee_name_or_email}'."

        if not (
            _is_staff(current_user)
            or task.created_by_id == current_user.id
            or task.assignee_id == current_user.id
        ):
            return "You are not allowed to reassign this task."

        task.assignee_id = person.id
        task.updated_at = datetime.now(timezone.utc)
        db.commit()
        return f"Assigned task '{task.title}' to {person.name} <{person.email}>."

    return [
        count_projects,
        list_projects,
        create_project,
        list_people,
        count_tasks,
        create_task,
        assign_task,
    ]
