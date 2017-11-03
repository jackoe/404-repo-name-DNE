import flask
from flask import request
import json
import psycopg2
import sys
import datetime



#flask automatically serves everything in the static folder for us, which is really nice
app = flask.Flask(__name__)

@app.route('/')
def send_index():
    return flask.redirect("static/index.html", code=302)

@app.route('/addText/', methods=['POST'])
def foo():
    #print(request.values)
    if request.method == 'POST':
        f = request.data
        print(f)
    return "hi front-end!"

def executeSingleQuery(query, params = [], fetch = False):
    print(query, params)
    conn = psycopg2.connect("dbname=compsTestDB user=ubuntu")
    cur = conn.cursor()
    if len(params) == 0:
        cur.execute(query)
    else:
        cur.execute(query, params)
    conn.commit()
    result = cur.fetchall() if fetch else  None
    cur.close()
    conn.close()
    return result


"""
{
    firstName : "Jack",
    lastName : "Wines"
}
"""
@app.route('/addNewStudent/', methods = ["POST"])
def addNewStudent():
    firstName = request.form.get('firstName')
    lastName  = request.form.get( 'lastName')
    executeSingleQuery("INSERT INTO testStudents VALUES (%s, %s)", [firstName, lastName])
    return "\nHello frontend:)\n"


# strictly test for now
# going to get today's data later
@app.route('/getAttendance/<date>')
def getAttendance(date):
    return json.dumps(executeSingleQuery("SELECT * FROM dailyAttendance WHERE date= '" + date + "';",
        fetch = True), indent=4, sort_keys=True, default=str)
   
@app.route('/getMasterAttendance')
def getMasterAttendance():
    return json.dumps(executeSingleQuery("SELECT * FROM masterAttendance;",
        fetch = True), indent=4, sort_keys=True, default=str)
      
@app.route('/getDates')
def getDates():
    query = "SELECT DISTINCT date FROM dailyAttendance"
    return json.dumps(executeSingleQuery(query,fetch = True), indent=4, sort_keys=True, default=str)
    
@app.route('/temp', methods=["POST"])
def temp():
    query = "DROP TABLE IF EXISTS dailyAttendance;"
    query2 = "CREATE TABLE dailyAttendance (id int, firstName varchar(255), lastName varchar(255), art boolean, madeFood boolean, recievedFood boolean, leadership boolean, exersize boolean, mentalHealth boolean, volunteering boolean, oneOnOne boolean, comments varchar(1000), date date, time time)"
    executeSingleQuery(query, [])
    executeSingleQuery(query2, []) 
    
@app.route('/tempMaster', methods=["POST"])
def tempMaster():
    query = "DROP TABLE IF EXISTS masterAttendance;"
    query2 = "CREATE TABLE masterAttendance (date date, numAttend int, numArt int, numMadeFood int, numRecievedFood int, numLeadership int, numExersize int, numMentalHealth int, numVolunteering int, numOneOnOne int);"
    executeSingleQuery(query, [])
    executeSingleQuery(query2, []) 
    
@app.route('/selectActivity', methods=["POST"])
def selectActivity():
    column = request.form.get("column")
    date = request.form.get("date")
    name = request.form.get("name")
    nameList = name.split()
    
    first = nameList[0]
    last = nameList[1]
    query1 = "SELECT "+ column + " FROM dailyAttendance WHERE date = '" + date + "' AND firstName = '" + first + "' AND lastName = '" + last + "';"
    #currentStatus = executeSingleQuery(query1)
    result = json.dumps(executeSingleQuery(query1,fetch = True), indent=4, sort_keys=True, default=str)
    if "true" in result:
        query = "UPDATE dailyAttendance SET " +  column + " = 'FALSE' WHERE date = '" + date + "' AND firstName = '" + first + "' AND lastName = '" + last + "';"
    else:
        query = "UPDATE dailyAttendance SET " +  column + " = 'TRUE' WHERE date = '" + date + "' AND firstName = '" + first + "' AND lastName = '" + last + "';"
    executeSingleQuery(query, [])
    
@app.route('/addAttendant/', methods = ["POST"])
def addAttendant():
    #print(json.decode(request.data))
    firstName = request.form.get('firstName')
    lastName  = request.form.get( 'lastName')
    date = request.form.get('date')
    time = request.form.get('time')
    activityNames = ["art", "madeFood", "recievedFood", "leadership", "exercise", "mentalHealth", "volunteering", "oneOnOne", "comments"]
    activities = [request.form.get(activityName) for activityName in activityNames]
    id = request.form.get('id')
    if id != "":
        # time = datetime.datetime.now().time()
        # activities = activities.append(time, None)

        # add two more %s's for timeIn and timeOut. You won't.
        executeSingleQuery("INSERT INTO dailyAttendance VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        [id] + activities)
        return "true"
    else:
        query = "SELECT id FROM testStudents WHERE firstName LIKE '%" + firstName + "%' OR lastName LIKE '%" + lastName + "%';"
        databaseResult = executeSingleQuery(query, fetch = True)
        print(databaseResult[0][0])
        newString = "INSERT INTO dailyAttendance VALUES ('" + str(databaseResult[0][0]) + "', '" + firstName + "', '" +lastName +"', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE', '" + date + "','" + time + "');"
        #newString = "INSERT INTO dailyAttendance VALUES " + databaseResult[0] + ", " + firstName + ", " + lastName
        executeSingleQuery(newString, [])
        queryMaster = "SELECT numAttend FROM masterAttendance WHERE date = '" + date + "';"
        #result = executeSingleQuery(queryMaster)
        result = json.dumps(executeSingleQuery(queryMaster,fetch = True))
        newResult =json.loads(result)
    
        if result is None:
            newQuery = "INSERT INTO masterAttendance VALUES('" + date + "', '1', '0', '0', '0', '0', '0', '0', '0', '0');"
            executeSingleQuery(newQuery, [])
        else:
            print(newResult)
            numAttend = newResult[0][0]
            #print(result)
            print(numAttend)
            newNumAttend = numAttend + 1
            alterQuery = "UPDATE masterAttendance SET numAttend = '" + str(newNumAttend) + "' WHERE date = '" + date + "';"
            executeSingleQuery(alterQuery, [])
        
            
# If more than one "same name" student is available, return students

        if len(databaseResult) > 1:
            return json.dumps(databaseResult[:10])
        elif len(databaseResult) == 0:
            return "false"

# Roughly informed by https://www.postgresql.org/docs/9.6/static/app-psql.html#APP-PSQL-META-COMMANDS-COPY
@app.route('/download/<tableName>')
def downloadAttendanceSheet(tableName):
    query = "SELECT * FROM " + tableName + ";"
    databaseResult = executeSingleQuery(query, fetch = True)
    result = json.dumps(databaseResult)

    # csv = ""
    # for attendee in result:
    #     csv = "#" + attendee[0] + "," + attendee[1] + "," + attendee[2] + csv
    # csv = csv[1:]
    # csv = csv.replace("#", "\n")

    return result

"""
    Literally just takes a string. Compares both first and last name.
"""
@app.route('/autofill/<partialString>')
def autofill(partialString):
    nameList = partialString.split()
    if (len(nameList) > 1):
        first = nameList[0].upper()
        last = nameList[1].upper()
        query = "SELECT * FROM testStudents WHERE UPPER(firstName) LIKE '%" + first + "%' OR UPPER(lastName) LIKE '%" + last + "%';"
    else:
        q = partialString.upper()
        query = "SELECT * FROM testStudents WHERE UPPER(firstName) LIKE '%" + q + "%' OR UPPER(lastName) LIKE '%" + q + "%';"
    databaseResult = executeSingleQuery(query, fetch = True)
    suggestions = json.dumps(databaseResult[:10])
    return suggestions

@app.route('/studentProfile/<string>')
def studentProfile(string):
    nameList = string.split()
    first = nameList[0]
    last = nameList[1]
    query = "SELECT id FROM testStudents WHERE firstName LIKE '%" + first + "%' OR lastName LIKE '%" + last + "%';"
    databaseResult = executeSingleQuery(query, fetch = True)
    result = json.dumps(databaseResult)
    return result

# @app.route('/getID/<string>')
# def getStudentID(string):
#     nameList = string.split()
#     first = nameList[0].upper()
#     last = nameList[1].upper()
#     query = "SELECT id FROM teststudents WHERE UPPER(firstname) LIKE '%" + first + "%' AND UPPER(lastname) LIKE '%" + last + "%';"
#     databaseResult = executeSingleQuery(query, fetch = True)
#     return databaseResult;

@app.route('/getID/<string>')
def getStudentID(string):
    return autofill(string)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "local":
        app.run()
    else:
        app.run(host='ec2-35-160-216-144.us-west-2.compute.amazonaws.com')
