DROP SCHEMA IF EXISTS `suplementos`;

CREATE SCHEMA IF NOT EXISTS `suplementos` DEFAULT CHARACTER SET utf8;

USE suplementos;

DROP TABLE IF EXISTS `suplementos`.`formato`;

CREATE TABLE IF NOT EXISTS `suplementos`.`formato` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `suplementos`.`produto`;

CREATE TABLE IF NOT EXISTS `suplementos`.`produto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(200) NOT NULL,
  `preco_unitario` FLOAT NOT NULL,
  `estrelas_5` INT NOT NULL,
  `estrelas_4` INT NOT NULL,
  `estrelas_3` INT NOT NULL,
  `estrelas_2` INT NOT NULL,
  `estrelas_1` INT NOT NULL,
  `estrelas_media` FLOAT NOT NULL,
  `total_avaliacoes` INT NOT NULL,
  `recomendacoes` INT NOT NULL,
  `id_formato` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `produto_formato`
      FOREIGN KEY (`id_formato`)
      REFERENCES `suplementos`.`formato` (`id`)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `suplementos`.`categoria`;

CREATE TABLE IF NOT EXISTS `suplementos`.`categoria` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `suplementos`.`cats_prods`;

CREATE TABLE IF NOT EXISTS `suplementos`.`cats_prods` (
    `id_produto` INT NOT NULL,
    `id_categoria` INT NOT NULL,
    PRIMARY KEY (`id_produto`, `id_categoria`),
    CONSTRAINT `prod_cats_prods`
      FOREIGN KEY (`id_produto`)
      REFERENCES `suplementos`.`produto` (`id`)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT `cat_cats_prods`
      FOREIGN KEY (`id_categoria`)
      REFERENCES `suplementos`.`categoria` (`id`)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);