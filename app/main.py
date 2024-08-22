
from app import db
from app.models import User, Table, Guest


class UserManager:

    def get_all_users(self):
        return User.query.all()

    def load_user(self, user_id):
        return User.query.get(int(user_id))

    def authemticate_user(self, username, password):
        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            return user
        return None

    def create_user(self, username, password):
        new_user = User(username=username)
        new_user.set_password(password)

        try:
            db.session.add(new_user)
            db.session.commit()
            return True
        except Exception:
            db.session.rollback()
            return False


class TableManager:

    def get_all_tables(self):
        return Table.query.all()

    def create_table(self, table_number):
        db.session.add(Table(table_number=table_number))
        db.session.commit()

    def delete_table(self, table_number: int) -> bool:
        if table := Table.query.get(table_number):
            db.session.delete(table)
            db.session.commit()
            return True
        return False

    def reset_table_guests(self, table_number: int):
        guests = Guest.query.filter_by(table_number=table_number).all()

        if not guests:
            return False

        for guest in guests:
            guest.confirmed = False

        db.session.commit()

        return False


class GuestManager:

    def get_guests_by_table(self, table_number: str):
        return Guest.query.filter_by(table_number=table_number).all()

    def register_guest(
        self,
        name: str,
        surname: str,
        guest_id: int,
        table_number: int
    ):
        db.session.add(
            Guest(
                name=name,
                surname=surname,
                guest_id=guest_id,
                table_number=table_number
            )
        )
        db.session.commit()

    def register_couple(
        self,
        name1: str,
        surname1: str,
        name2: str,
        surname2: str,
        guest_id: int,
        table_number: int
    ):
        db.session.add(
            Guest(
                name=name1,
                surname=surname1,
                guest_id=guest_id,
                table_number=table_number
            )
        )
        db.session.add(
            Guest(
                name=name2,
                surname=surname2,
                guest_id=guest_id,
                table_number=table_number
            )
        )
        db.session.commit()

    def confirm_guest(self, guest_id):
        guest = Guest.query.get(guest_id)

        if not guest:
            return False
        guest.confirmed = True
        db.session.commit()

        return True

    def search_guest(self, query):
        matched_guests = {}

        for guest in Guest.query.all():
            name_low = guest.name.lower()
            if query in name_low or query == name_low:
                table_number = guest.table_number 
                if table_number not in matched_guests:
                    matched_guests[table_number] = []
                matched_guests[table_number].append({
                    "id": guest.id,
                    "name": guest.name,
                    "surname": guest.surname,
                    "confirmed": guest.confirmed,
                })

        return matched_guests
