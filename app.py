from flask import Flask, render_template, json, request, Response, send_file, abort
from datetime import datetime
import config
import os
import banco
import joblib
import pandas as pd

app = Flask(__name__)

@app.get('/')
def index():
    hoje = datetime.today().strftime('%Y-%m-%d')
    return render_template('index/index.html', hoje=hoje)

@app.get('/sobre')
def sobre():
    return render_template('index/sobre.html', titulo='Sobre Nós')

@app.get('/dashboard')
def dashboard():
    return render_template('index/dashboard.html', titulo='Dashboard')

@app.get('/dados')
def dados():
    return render_template('index/dados.html', titulo='Dados')

@app.get('/login')
def login():
    return render_template('index/login.html', titulo='Login', layout2 = True)

@app.get('/registrar')
def registrar():
    return render_template('index/registrar.html', titulo='Registrar', layout2 = True)

@app.get('/obterDados')
def obterDados():
    dados = banco.listarProdutos()
    return json.jsonify(dados)

@app.get('/exportarDados')
def exportarDados():
    csv_path = os.path.join(app.root_path, 'produtos.csv')
    if not os.path.exists(csv_path):
        abort(404)

    return send_file(csv_path, mimetype='text/csv', as_attachment=True)

model = joblib.load("models/svm_model.pkl")
scaler = joblib.load("models/scaler.pkl")
encoder = joblib.load("models/encoder.pkl")

features_num = ["preco", "estrelas_media", "avaliacoes"]
features_cat = ["formato"]

@app.route("/predicao", methods=["POST"])
def predicao():
    data = request.json

    X_num = pd.DataFrame([{
        "preco": float(data["preco"]),
        "estrelas_media": float(data["estrelas_media"]),
        "avaliacoes": int(data["avaliacoes"])
    }])

    X_cat = pd.DataFrame([{
        "formato": data["formato"]
    }])

    X_num_scaled = scaler.transform(X_num)
    X_cat_encoded = encoder.transform(X_cat)

    X_final = pd.concat([
        pd.DataFrame(X_num_scaled, columns=features_num),
        pd.DataFrame(X_cat_encoded.toarray(),
                     columns=encoder.get_feature_names_out())
    ], axis=1)

    prediction = model.predict(X_final)[0]
    prediction = round(float(prediction), 2)
    
    if prediction > 100:
        prediction = 100
    elif prediction < 0:
        prediction = 0

    return json.jsonify({
        "predicao": prediction
    })

if __name__ == '__main__':
    app.run(host=config.host, port=config.port)