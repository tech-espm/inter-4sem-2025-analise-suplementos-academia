from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from flask import jsonify, make_response
from config import conexao_banco

engine = create_engine(conexao_banco)

def inserirFormato(nome: str):
    try:
        with Session(engine) as sessao, sessao.begin():
            
            sessao.execute(text("INSERT INTO formato (nome) VALUES (:nome)"), {"nome": nome})
            return True
        
    except Exception as e:
        print(f"Erro ao inserir formato: {e}")
        return make_response(jsonify({"erro": "Erro interno do servidor"}), 500)

def inserirCategoria(nome: str):
    try:
        with Session(engine) as sessao, sessao.begin():
            
            sessao.execute(text("INSERT INTO categoria (nome) VALUES (:nome)"), {"nome": nome})
            return True
        
    except Exception as e:
        print(f"Erro ao inserir categoria: {e}")
        return make_response(jsonify({"erro": "Erro interno do servidor"}), 500)

def inserirProduto(nome: str, preco: float, e5: int, e4: int, e3: int, e2: int, e1: int, emedia: float, avals: int, recom: int, id_form: int):
    
    try:
        with Session(engine) as sessao, sessao.begin():
            
            produto = {
                "nome": nome,
                "preco": preco,
                "e5": e5,
                "e4": e4,
                "e3": e3,
                "e2": e2,
                "e1": e1,
                "emedia": emedia,
                "avals": avals,
                "recom": recom,
                "id_form": id_form
            }
            
            sessao.execute(text("""
                                INSERT INTO produto (
                                    nome, preco_unitario, estrelas_5, estrelas_4, estrelas_3, estrelas_2, estrelas_1, estrelas_media, total_avaliacoes, recomendacoes, id_formato
                                    )
                                    VALUES (
                                        :nome, :preco, :e5, :e4, :e3, :e2, :e1, :emedia, :avals, :recom, :id_form
                                        )
                                """
                                ), produto)
            
            return True

    except Exception as e:
        print(f"Erro ao inserir produto: {e}")
        return make_response(jsonify({"erro": "Erro interno do servidor"}), 500)

def inserirCatprod(id_produto: int, id_categoria: int):
    try:
        with Session(engine) as sessao, sessao.begin():
            
            sessao.execute(text("INSERT INTO cats_prods (id_produto, id_categoria) VALUES (:id_produto, id_categoria)"), {"id_produto": id_produto, "id_categoria": id_categoria})
            return True
        
    except Exception as e:
        print(f"Erro ao inserir relação categoria-produto: {e}")
        return make_response(jsonify({"erro": "Erro interno do servidor"}), 500)