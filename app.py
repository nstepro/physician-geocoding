#!flask/bin/python
from flask import Flask, redirect, url_for
from flask import Response
import json, decimal
import psycopg2
from flask_cors import CORS
import simplejson as json
from decimal import Decimal

json.loads('1.1', use_decimal=True) == Decimal('1.1')
json.dumps(Decimal('1.1'), use_decimal=True) == '1.1'

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def decimal_default(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError        
        
app = Flask(__name__)
CORS(app)
***REMOVED***
cur = conn.cursor()

@app.route('/')
def home():
  return redirect(url_for('static', filename='index.html'))

@app.route("/getProviders/<organization>/", methods=['GET'])
def getProviders(organization):
  cur.execute("select * from providergeocode where organization = '" + organization + "'")
  data = cur.fetchall()  
  output=[]
  str(data)
  for item in data:
    i = {
    'reportName':item[0],
    'npi':item[1],
    'freq':item[2],
    'lastName':item[3],
    'firstName':item[4],
    'middleName':item[5],
    'categoryName':item[6],
    'pcpFlag':item[7],
    'streetAddress':item[8],
    'city':item[9],
    'state':item[10],
    'zip':item[11],
    'specialty':item[12],
    'organization':item[13],
    'latitude':item[14],
    'longitude':item[15],
    'accuracyScore':item[16],
    'accuracyType':item[17]
    }
    output.append(i)
  data = json.dumps(output)
  resp = Response(data, status=200, mimetype='application/json')
  return resp

if __name__ == '__main__':
    app.run(debug=True)    
