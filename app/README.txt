The folder "app" cotains a django app (located in "backend") and a react frontend (located in "frontend").

To start up the backend, you'll first need to install "pipenv." Google it or you can try "pip install --user pipenv" via a terminal window. Next, via terminal, cd into "myapp\backend" and run "pipenv install", "pipenv shell", and finally "manage.py runserver". Leave this terminal window open, it is running the backend now (hopefully).

To run the frontend, you'll need Node installed. Google it. In a new terminal window, cd into "myapp\frontend" and run "npm install" followed by "npm start". A browser window should open up with a list of "Key Youths."

Here's the tutorial I followed if you want to get a sense for how things interact: https://wsvincent.com/django-rest-framework-react-tutorial/
