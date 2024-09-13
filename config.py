import configparser

from flask_sqlalchemy import SQLAlchemy

from app import app


config = configparser.ConfigParser()
config.read('config/config.ini')


DB = SQLAlchemy(app)
ADM_USERNAME: str = config.get("admin", "username")
ADM_PWD: str = config.get("admin", "password")
