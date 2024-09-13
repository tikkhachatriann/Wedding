from app import app
from app.main import create_admin


if __name__ == "__main__":
    with app.app_context():
        create_admin()
    app.run(debug=True)
