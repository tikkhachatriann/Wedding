from flask import (
    session,
    request,
    flash,
    url_for,
    jsonify,
    redirect,
    render_template
)
from flask_login import login_user, login_required, logout_user

from app import app, login_manager
from main import UserManager, GuestManager, TableManager


user_manager = UserManager() 
table_manager = TableManager()
guest_manager = GuestManager()


@login_manager.user_loader
def load_user(user_id):
    return user_manager.load_user(user_id)


@app.route("/")
def index():
    return render_template("home.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    data = request.form

    if user := user_manager.authemticate_user(
        data["username"], data["password"]
    ):
        login_user(user)

        return redirect(url_for("admin_dashboard"))
    else:
        return "Invalid username or password"


@app.route("dashboard", methods=["GET", "POST"])
@login_required
def admin_dashboard():
    if request.method == "POST":
        data = request.form
        if user_manager.create_user(data["username"], data["password"]):
            flash("User created successfully", "success")
        else:
            flash("Failed to create user", "error")

        return redirect(url_for("admin_dashboard"))

    user = user_manager(session.get("_user_id"))
    tables = table_manager.get_all_tables()

    return render_template(
        "admin_dashboard.html",
        users=user_manager.get_all_users(),
        tables=tables,
        guests_by_table={
            table.table_number: guest_manager.get_guests_by_table(
                table.table_number
            )
            for table in tables
        },
        is_admin=user.is_admin if user else False
    )


@app.route("/create_table", methods={"POST"})
def create_table():
    table_manager.create_table(request.json["tableNumber"])

    return jsonify({
        "tables": {"id": table.id, "table_number": table.table_number}
        for table in table_manager.get_all_tables()
    })


@app.route("/reset_table_guests", methods=["Post"])
def reset_table_guests():
    if table_manager.reset_table_guests(request.json.get("tableId")):
        return jsonify({
            "message": "All guests for the table have been reset successfully."
        }), 200
    else:
        return jsonify({"message": "No guests found for this table."}), 404

