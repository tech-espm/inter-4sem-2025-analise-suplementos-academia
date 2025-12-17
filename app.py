from flask import Flask, render_template, json, request, Response, send_file, abort
from datetime import datetime
import config
import os
import banco

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

if __name__ == '__main__':
    app.run(host=config.host, port=config.port)