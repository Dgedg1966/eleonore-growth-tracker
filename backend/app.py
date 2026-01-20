from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Pour permettre au frontend React d'appeler

@app.route('/growth')
def get_growth():
    df = pd.read_excel('Eléonore.xlsx', sheet_name='Poids et Taille')
    data = df.to_dict(orient='records')
    return jsonify(data)

@app.route('/nutrition')
def get_nutrition():
    df = pd.read_excel('Eléonore.xlsx', sheet_name='Lait')
    # Parsing simple – adapte comme tu veux
    data = []  # Ton parsing ici
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
