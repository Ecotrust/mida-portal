West Coast Ocean Alliance (WCOA) Data Portal
=====

Django web application and Wagtail CMS for the West Coast Ocean Data Portal.

## Local Vagrant Development Env

requirements:
  - git
  - vagrant

1. Choose a working project directory that will be referred to from here has PROJDIR (i.e. /home/username/src/ ). It is best if it’s a directory you use to hold all of your dev projects.
  ```
  cd PROJDIR
  git clone https://github.com/Ecotrust/marco-portal2.git
  mv marco-portal2 ocean_portal
  cd ocean_portal
  vagrant up
  vagrant ssh
  ```

2. Install dependencies
  ```
  sudo apt update
  sudo apt upgrade -y
  sudo apt install git python3 python3-dev python3-virtualenv python3-pip postgresql postgresql-contrib postgis postgresql-server-dev-10 libjpeg-dev gdal-bin python-gdal python3-gdal libgdal-dev -y
  ```

3. Edit requirements.txt
  ```
  vim /usr/local/apps/ocean_portal/requirements.txt
  ```

4. Add WCOA app to requirements.txt
  ```
  -e git+https://github.com/Ecotrust/wcoa.git@master#egg=wcoa-master
  ```

5. Set up virtualenv
  ```
  python3 -m pip install --user virtualenv
  cd /usr/local/apps/ocean_portal/
  python3 -m virtualenv env
  source /usr/local/apps/ocean_portal/env/bin/activate
  pip install -r /usr/local/apps/ocean_portal/requirements.txt
  pip uninstall numpy
  gdal-config --version
  pip install "pygdal<2.2.4"
  ```

6. Install database
  ```
  sudo -u postgres createdb -O postgres ocean_portal
  sudo -u postgres psql -c "CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;" ocean_portal
  sudo vim /etc/postgresql/10/main/pg_hba.conf
  #--------
  	<update line near bottom regarding ‘local   all   postgres’
  		Change ‘peer’ to ‘trust’ >
  #---------
  sudo service postgresql restart
  ```

7. Configure project
  ```
  cd /usr/local/apps/ocean_portal/marco
  mkdir media
  mkdir static
  cp config.ini.template config.ini
  vim config.ini
  ```

8. Edit config.ini
  - Add the following lines under `[App]`:
    ```
      PROJECT_APP = wcoa
      PROJECT_SETTINGS_FILE = True
      MEDIA_ROOT = /usr/local/apps/ocean_portal/marco/media
  	  STATIC_ROOT = /usr/local/apps/ocean_portal/marco/static
    ```
  - Add the following under [DATABASE]:
    ```
      USER = postgres
  	  NAME = ocean_portal
    ```

9. Add shortcuts
  ```
  vim ~/.bashrc
  #----------
  alias dj="/usr/local/apps/ocean_portal/env/bin/python3 /usr/local/apps/ocean_portal/marco/manage.py"

  alias djrun="dj runserver 0:8000"
  #----------
  ```

10. Exit ssh session and re-ssh in
  ```
  crtl+d
  vagrant ssh
  ```

11. Set up Django
  ```
  dj makemigrations
  dj migrate
  dj compress
  dj collectstatic
  dj loaddata /usr/local/apps/ocean_portal/marco/marco_site/fixtures/content.json
  djrun
  ```

12. Open http://localhost:8000 in your browser

13. Create super user
  ```
  dj createsuperuser
  ```

14. Open http://localhost:8000/django-admin and http://localhost:8000/admin in your browser to administer the site





Notes

Forked Marco-portal-2 from MidAtlanticPortal GitHub account to Ecotrust:
https://github.com/Ecotrust/marco-portal2

Cloned it locally, updated the vagrant file to give me an Ubuntu 18.04 LTS box

vagrant up
vagrant ssh

sudo apt-get update
sudo apt-get upgrade

The Compass install docs were a nice guideline for setting up MP, perhaps they will be useful for the portal as well….
https://github.com/Ecotrust/COMPASS/wiki/install

 Upgrading to Wagtail 2.0+: https://wagtail.io/blog/upgrading-to-wagtail-2/
 
 ## Production Installation (Ubuntu 18.04 LTS)
 1. set up new server
 ```
 sudo apt update
 sudo apt upgrade -y
 sudo apt install git python3 python3-dev python3-virtualenv python3-pip postgresql postgresql-contrib postgis postgresql-server-dev-10 libjpeg-dev gdal-bin python-gdal python3-gdal libgdal-dev -y
 sudo mkdir /usr/local/apps
 ```
 change ownership of /usr/local/apps to be your primary sudo user:
 `sudo chown {USERNAME} /usr/local/apps`
 
 ```
 cd /usr/local/apps/
 git clone https://github.com/Ecotrust/marco-portal2.git
 mv marco-portal2 ocean_portal
 cd ocean_portal
 git checkout wcoa
 git pull
 ```
 
 2. Set up virtualenv
  ```
  python3 -m pip install --user virtualenv
  cd /usr/local/apps/ocean_portal/
  python3 -m virtualenv env
  source /usr/local/apps/ocean_portal/env/bin/activate
  pip install -r /usr/local/apps/ocean_portal/requirements.txt
  pip install -e git+https://github.com/Ecotrust/wcoa.git@master#egg=wcoa-master
  ```
  
3. Install PyGDAL
  ```
  pip uninstall numpy
  gdal-config --version
  ```
  Note what version is printed. You will want to intall the correct pygdal for your system's GDAL.
  
  For example, if the printed version is '2.2.3', then you will want the latest pyGDAL in the 2.2.3 family:
  `pip install "pygdal<2.2.4"`
 
  You should see a new version of numpy installed as well.

4. Install database
  Create a Database user. Come up with a meaningful username and a secure password. You will use the username in place of `{DBUSER}` below and you will be prompted to create the new user's password immediately.
  ```
  sudo -u postgres createuser -s -P {DBUSER}
  sudo -u postgres createdb -O {DBUSER} ocean_portal
  sudo -u postgres psql -c "CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;" ocean_portal
  sudo vim /etc/postgresql/10/main/pg_hba.conf
  ```
  Add the following line to the bottom of the pg_hba.conf file, replacing `{DBUSER}` with the username you created:
  ```
  local   ocean_portal    {DBUSER}                               md5
  ```
  Finally, restart postgres so your updated configuration can be implemented.
  ```
  sudo service postgresql restart
  ```

5. Configure project
  ```
  cd /usr/local/apps/ocean_portal/marco
  mkdir media
  mkdir static
  cp config.ini.template config.ini
  vim config.ini
  ```

6. Edit config.ini
  - Add the following lines under `[App]`:
    ```
      PROJECT_APP = wcoa
      PROJECT_SETTINGS_FILE = True
      MEDIA_ROOT = /usr/local/apps/ocean_portal/marco/media
  	  STATIC_ROOT = /usr/local/apps/ocean_portal/marco/static
      EMAIL_SUBJECT_PREFIX = [WCOA]
    ```
  - Add the following under [DATABASE] (replacing `{DBPASSWORD}` with the password you created above):
    ```
  	  NAME = ocean_portal
      USER = postgres
      PASSWORD = {DBPASSWORD}
    ```

7. Add shortcuts
  ```
  vim ~/.bashrc
  #----------
  alias dj="/usr/local/apps/ocean_portal/env/bin/python3 /usr/local/apps/ocean_portal/marco/manage.py"
  #----------
  ```
  Exit your terminal session and re-SSH in to the server to load your updates

8. Set up Django
  ```
  dj migrate
  dj compress
  dj collectstatic
  ```
  
9. Load in initial data

10. Configure and enable webapplication server stack: Nginx + uWSGI

11. Install munin

12. Configure unattended upgrades

13. Install Certbox and configure SSL Certs

14. Restart your server and test
