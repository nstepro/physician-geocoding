#!flask/bin/python
from flask import Flask, redirect, url_for
from flask import Response
from flask_basicauth import BasicAuth
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
conn = psycopg2.connect("dbname=##dbname user=##username password=##password host=##hosturl port=##port")
cur = conn.cursor()

app.config['BASIC_AUTH_USERNAME'] = 'user'
app.config['BASIC_AUTH_PASSWORD'] = 'password'
app.config['BASIC_AUTH_FORCE'] = True

basic_auth = BasicAuth(app)

@app.route('/')
@basic_auth.required
def home():
  return redirect(url_for('static', filename='index.html'))

@app.route("/getProviders/<organization>/<minfreq>/", methods=['GET'])
def getProviders(organization, minfreq):
  cur.execute("select * from getProviderGeocode('"+organization+"',"+minfreq+")")
  data = cur.fetchall()  
  output=[]
  str(data)
  for item in data:
    i = {
    'reportName':item[0],
    'npi':item[1],
    'freq':item[2],
    'categoryName':item[3],
    'streetAddress':item[4],
    'city':item[5],
    'state':item[6],
    'specialty':item[7],
    'organization':item[8],
    'latitude':item[9],
    'longitude':item[10]
    }
    output.append(i)
  data = json.dumps(output)
  resp = Response(data, status=200, mimetype='application/json')
  return resp

if __name__ == '__main__':
    app.run(debug=True)    
