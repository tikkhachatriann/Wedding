from flask import Flask

from flask_migrate import Migrate
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SECRET_KEY'] = 'your_secret_key'


db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)


from app import routes, models

from app.models import User


def create_admin():
    with app.app_context():
        admin = User.query.filter_by(username="Tigrank").first()
        if admin:
            admin.is_admin = True
            db.session.commit()
        else:
            admin = User(username="Tigrank", is_admin=True)
            admin.set_password("khachatryan_01")
            db.session.add(admin)
            db.session.commit()


create_admin()

