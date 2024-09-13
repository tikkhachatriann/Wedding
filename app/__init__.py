from flask import Flask

from flask_migrate import Migrate
from flask_login import LoginManager

from config import DB

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SECRET_KEY'] = 'your_secret_key'


migrate = Migrate(app, DB)
login_manager = LoginManager(app)

from app import routes, models
