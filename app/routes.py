from flask import (
    render_template,
    jsonify,
    redirect,
    url_for,
    flash,
    request,
    session
)
from flask_login import login_user, login_required, logout_user

from app import app, login_manager
from app.models import User, Table, Guest

from config import DB


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route("/")
def index():
    return render_template("home.html")


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':

        data = request.form
        user = User.query.filter_by(username=data["username"]).first()

        if user and user.check_password(data["password"]):
            login_user(user)

            return redirect(url_for("admin_dashboard"))
        else:
            return 'Invalid username or password'

    return render_template('login.html')


@login_required
@app.route('/dashboard', methods=['GET', 'POST'])
def admin_dashboard():
    if request.method == "POST":

        data = request.form

        new_user = User(username=data["username"])
        new_user.set_password(data["password"])

        try:
            DB.session.add(new_user)
            DB.session.commit()

            flash("User created successfully", "success")

            return redirect(url_for("admin_dashboard"))

        except Exception:
            DB.session.rollback()
            flash('Failed to create user!', 'error')

    user = User.query.get(session.get("_user_id"))

    tables = Table.query.all()
    guests_by_table = {
        table.table_number:
        Guest.query.filter_by(table_number=table.table_number).all()
        for table in tables
    }

    return render_template(
        'admin_dashboard.html',
        users=User.query.all(),
        tables=tables,
        guests_by_table=guests_by_table,
        is_admin=user.is_admin if user else False

    )


@app.route('/create_table', methods=['POST'])
def create_table():
    DB.session.add(Table(table_number=request.json.get('tableNumber')))
    DB.session.commit()

    return jsonify({
        'tables': [
            {'id': table.id, 'table_number': table.table_number}
            for table in Table.query.all()
        ]
    })


@app.route('/reset_table_guests', methods=['POST'])
def reset_table_guests():
    data = request.get_json()
    table_id = data.get('tableId')

    if not table_id:
        return jsonify({"message": "Table ID is required."}), 400

    try:
        guests = Guest.query.filter_by(table_number=table_id).all()

        if not guests:
            return jsonify({"message": "No guests found for this table."}), 404

        for guest in guests:
            guest.confirmed = False

            # DB.session.delete(guest)

        DB.session.commit()

        return jsonify({
            "message": "All guests for the table have been reset successfully."
        }), 200
    except Exception as e:
        DB.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@app.route("/delete_table", methods=["POST"])
def delete_table():
    if table := Table.query.get(request.get_json().get("tableId")):
        DB.session.delete(table)
        DB.session.commit()

        return jsonify({"message": "Table deleted successfully"}), 200
    else:
        return jsonify({"message": "Table not found"}), 404


@app.route('/guests/<int:table_id>')
def get_guests(table_id):
    user = User.query.get(session.get("_user_id"))

    return render_template(
        'guests.html',
        table_id=table_id,
        is_admin=user.is_admin if user else False,
        guests_list=Guest.query.filter_by(table_number=table_id).all()
    )


@app.route("/register_guest", methods=["POST"])
def register_guest():
    data = request.form

    for value in data.values():
        if not value:
            return jsonify({'message': 'Failed to register couple!'}), 400

    if len(data) < 5:
        DB.session.add(
            Guest(
                name=data.get("name"),
                surname=data.get("surname"),
                guest_id=data.get("guest_id"),
                table_number=data.get("table_number")
            )
        )
    else:
        DB.session.add(
            Guest(
                name=data.get("name1"),
                surname=data.get("surname1"),
                guest_id=data.get("guest_id"),
                table_number=data.get("table_number")
            )
        )
        DB.session.add(
            Guest(
                name=data.get("name2"),
                surname=data.get("surname2"),
                guest_id=data.get("guest_id"),
                table_number=data.get("table_number")
            )
        )

    DB.session.commit()

    return redirect(url_for("admin_dashboard"))


@app.route('/search', methods=['GET'])
def search():
    if query := request.args.get('query').lower:
        matched_guests = {}

        for guest in Guest.query.all():
            if (
                guest.name.lower() in query
                and guest.surname.lower() in query
                or guest.name.lower() == query
            ):
                table_number = guest.table_number
                if table_number not in matched_guests:
                    matched_guests[table_number] = []

                matched_guests[table_number].append({
                    'id': guest.id,
                    "name": guest.name,
                    "surname": guest.surname,
                    "confirmed": guest.confirmed
                })

        if not any(matched_guests.values()):
            return "No matching record found"
    else:
        matched_guests = {}

    return render_template('search.html', guests=matched_guests)


@app.route('/confirm_guest', methods=['POST'])
def confirm_guest():
    guest_id = request.json.get('guest_id')
    guest = Guest.query.get(guest_id)

    if not guest_id or not guest:
        return jsonify({"message": "Հյուրը չի գտվնել"}), 404

    guest.confirmed = True
    DB.session.commit()

    return jsonify({
        "message": "Հյուրը հաջողությամբ հաստատվեց"
    })


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return 'Logged out successfully!'
