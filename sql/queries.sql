use suplementos;

-- Query da Tati: Nome, Preço, Estrelas Média, Total de Avaliações, Formato, Categorias

SELECT 
   p.nome,
   preco_unitario,
   estrelas_media,
   total_avaliacoes,
   recomendacoes,
   f.nome as "formato",
   GROUP_CONCAT(c.nome ORDER BY c.nome SEPARATOR ", ") as "categorias"
  FROM produto p
  INNER JOIN formato f on f.id = p.id_formato
  LEFT JOIN cats_prods cp ON cp.id_produto = p.id
  LEFT JOIN categoria c ON c.id = cp.id_categoria
  WHERE p.id = 1;

-- Listar produtos

SELECT
     p.id,
     p.nome,
     preco_unitario,
     estrelas_media,
     total_avaliacoes,
     recomendacoes,
     f.nome as "formato",
     GROUP_CONCAT(c.nome ORDER BY c.nome SEPARATOR ", ") as "categorias"
    FROM produto p
    INNER JOIN formato f on f.id = p.id_formato
    LEFT JOIN cats_prods cp ON cp.id_produto = p.id
    LEFT JOIN categoria c ON c.id = cp.id_categoria
    GROUP BY 
    p.id, p.nome, p.preco_unitario, p.estrelas_media,
    p.total_avaliacoes, f.nome;