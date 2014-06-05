SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `Mario` ;
CREATE SCHEMA IF NOT EXISTS `Mario` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci ;
USE `Mario` ;

-- -----------------------------------------------------
-- Table `Mario`.`User`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Mario`.`User` ;

CREATE  TABLE IF NOT EXISTS `Mario`.`User` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(45) NOT NULL ,
  `user_password` VARCHAR(45) NOT NULL ,
  PRIMARY KEY (`user_id`) ,
  UNIQUE INDEX `user_name_UNIQUE` (`user_name` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Mario`.`LevelSequences`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Mario`.`LevelSequences` ;

CREATE  TABLE IF NOT EXISTS `Mario`.`LevelSequences` (
  `ls_id` INT NOT NULL AUTO_INCREMENT,
  `ls_name` VARCHAR(45) NOT NULL ,
  `user_id` INT NOT NULL ,
  PRIMARY KEY (`ls_id`) ,
  INDEX `fk_LevelSequences_User_idx` (`user_id` ASC) ,
  UNIQUE INDEX `ls_name_UNIQUE` (`ls_name` ASC) ,
  CONSTRAINT `fk_LevelSequences_User`
    FOREIGN KEY (`user_id` )
    REFERENCES `Mario`.`User` (`user_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Mario`.`level`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Mario`.`level` ;

CREATE  TABLE IF NOT EXISTS `Mario`.`level` (
  `level_id` INT NOT NULL AUTO_INCREMENT,
  `level_name` VARCHAR(45) NOT NULL ,
  `ls_id` INT NOT NULL ,
  PRIMARY KEY (`level_id`) ,
  INDEX `fk_level_LevelSequences1_idx` (`ls_id` ASC) ,
  CONSTRAINT `fk_level_LevelSequences1`
    FOREIGN KEY (`ls_id` )
    REFERENCES `Mario`.`LevelSequences` (`ls_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Mario`.`Scores`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Mario`.`Scores` ;

CREATE  TABLE IF NOT EXISTS `Mario`.`Scores` (
  `user_id` INT NOT NULL ,
  `ls_id` INT NOT NULL ,
  `score` INT NOT NULL ,
  PRIMARY KEY (`user_id`, `ls_id`) ,
  INDEX `fk_Scores_User1_idx` (`user_id` ASC) ,
  INDEX `fk_Scores_LevelSequences1_idx` (`ls_id` ASC) ,
  CONSTRAINT `fk_Scores_User1`
    FOREIGN KEY (`user_id` )
    REFERENCES `Mario`.`User` (`user_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Scores_LevelSequences1`
    FOREIGN KEY (`ls_id` )
    REFERENCES `Mario`.`LevelSequences` (`ls_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
