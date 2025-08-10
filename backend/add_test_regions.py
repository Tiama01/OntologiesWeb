#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AJOUT DE RÉGIONS DE TEST POUR NEO4J
Script pour ajouter des régions de test si l'ontologie n'en contient pas
"""

from neo4j import GraphDatabase
import logging

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestDataAdder:
    """Ajoute des données de test pour les régions."""
    
    def __init__(self, neo4j_uri: str = "bolt://localhost:7687", 
                 username: str = "neo4j", password: str = "password"):
        self.neo4j_uri = neo4j_uri
        self.username = username
        self.password = password
        self.driver = None
        
    def connect_neo4j(self):
        """Connexion à Neo4j."""
        try:
            self.driver = GraphDatabase.driver(self.neo4j_uri, 
                                             auth=(self.username, self.password))
            # Test de connexion
            with self.driver.session() as session:
                result = session.run("RETURN 1 as test")
                logger.info("✅ Connexion Neo4j réussie")
        except Exception as e:
            logger.error(f"❌ Erreur connexion Neo4j: {e}")
            raise
    
    def add_test_regions(self):
        """Ajoute des régions de test."""
        regions = [
            {
                "nom": "Centre",
                "description": "Région centrale du Burkina Faso, incluant Ouagadougou",
                "latitude": 12.3714,
                "longitude": -1.5197,
                "ethnies_majoritaires": "Mossi, Gourounsi"
            },
            {
                "nom": "Hauts-Bassins",
                "description": "Région des Hauts-Bassins, incluant Bobo-Dioulasso",
                "latitude": 11.1783,
                "longitude": -4.2891,
                "ethnies_majoritaires": "Bobo, Dioula, Sénoufo"
            },
            {
                "nom": "Sahel",
                "description": "Région sahélienne au nord du pays",
                "latitude": 14.1000,
                "longitude": -0.2333,
                "ethnies_majoritaires": "Peul, Touareg, Bella"
            },
            {
                "nom": "Est",
                "description": "Région orientale du Burkina Faso",
                "latitude": 12.2500,
                "longitude": 0.5000,
                "ethnies_majoritaires": "Gourmantché, Mossi"
            },
            {
                "nom": "Sud-Ouest",
                "description": "Région du sud-ouest, frontière avec la Côte d'Ivoire",
                "latitude": 10.3333,
                "longitude": -3.1667,
                "ethnies_majoritaires": "Lobi, Dagara, Birifor"
            },
            {
                "nom": "Boucle du Mouhoun",
                "description": "Région de la boucle du fleuve Mouhoun",
                "latitude": 12.5000,
                "longitude": -3.5000,
                "ethnies_majoritaires": "Bobo, Samo, Marka"
            },
            {
                "nom": "Cascades",
                "description": "Région des cascades de Banfora",
                "latitude": 10.6333,
                "longitude": -4.7667,
                "ethnies_majoritaires": "Sénoufo, Gouin, Turka"
            },
            {
                "nom": "Centre-Nord",
                "description": "Région du centre-nord du pays",
                "latitude": 13.5000,
                "longitude": -2.0000,
                "ethnies_majoritaires": "Mossi, Peul"
            },
            {
                "nom": "Centre-Est",
                "description": "Région du centre-est",
                "latitude": 12.0000,
                "longitude": 0.0000,
                "ethnies_majoritaires": "Gourmantché, Mossi"
            },
            {
                "nom": "Centre-Sud",
                "description": "Région du centre-sud",
                "latitude": 11.5000,
                "longitude": -1.0000,
                "ethnies_majoritaires": "Mossi, Gourounsi"
            },
            {
                "nom": "Centre-Ouest",
                "description": "Région du centre-ouest",
                "latitude": 12.0000,
                "longitude": -2.5000,
                "ethnies_majoritaires": "Mossi, Bobo"
            },
            {
                "nom": "Nord",
                "description": "Région septentrionale du pays",
                "latitude": 13.5000,
                "longitude": -2.5000,
                "ethnies_majoritaires": "Peul, Mossi, Touareg"
            },
            {
                "nom": "Plateau-Central",
                "description": "Région du plateau central",
                "latitude": 12.7500,
                "longitude": -0.7500,
                "ethnies_majoritaires": "Mossi, Gourounsi"
            }
        ]
        
        with self.driver.session() as session:
            for region in regions:
                # Vérifier si la région existe déjà
                result = session.run("MATCH (r:Region {nom: $nom}) RETURN r", nom=region["nom"])
                if result.single():
                    logger.info(f"⚠️ Région {region['nom']} existe déjà")
                    continue
                
                # Créer la région
                cypher_query = """
                CREATE (r:Region {
                    nom: $nom,
                    description: $description,
                    latitude: $latitude,
                    longitude: $longitude,
                    ethnies_majoritaires: $ethnies_majoritaires
                })
                """
                
                session.run(cypher_query, region)
                logger.info(f"✅ Région ajoutée: {region['nom']}")
        
        logger.info("✅ Ajout des régions de test terminé")
    
    def add_test_dialectes(self):
        """Ajoute des dialectes de test."""
        dialectes = [
            {
                "nom": "Ouagadougou",
                "description": "Dialecte mossi parlé à Ouagadougou",
                "langue_principale": "Mooré",
                "localite": "Ouagadougou"
            },
            {
                "nom": "Bobo-Dioulasso",
                "description": "Dialecte bobo parlé à Bobo-Dioulasso",
                "langue_principale": "Bobo",
                "localite": "Bobo-Dioulasso"
            },
            {
                "nom": "Dori",
                "description": "Dialecte peul parlé à Dori",
                "langue_principale": "Fulfuldé",
                "localite": "Dori"
            },
            {
                "nom": "Fada N'Gourma",
                "description": "Dialecte gourmantché parlé à Fada",
                "langue_principale": "Gourmantché",
                "localite": "Fada N'Gourma"
            },
            {
                "nom": "Gaoua",
                "description": "Dialecte lobi parlé à Gaoua",
                "langue_principale": "Lobi",
                "localite": "Gaoua"
            }
        ]
        
        with self.driver.session() as session:
            for dialecte in dialectes:
                # Vérifier si le dialecte existe déjà
                result = session.run("MATCH (d:Dialecte {nom: $nom}) RETURN d", nom=dialecte["nom"])
                if result.single():
                    logger.info(f"⚠️ Dialecte {dialecte['nom']} existe déjà")
                    continue
                
                # Créer le dialecte
                cypher_query = """
                CREATE (d:Dialecte {
                    nom: $nom,
                    description: $description,
                    langue_principale: $langue_principale,
                    localite: $localite
                })
                """
                
                session.run(cypher_query, dialecte)
                logger.info(f"✅ Dialecte ajouté: {dialecte['nom']}")
        
        logger.info("✅ Ajout des dialectes de test terminé")
    
    def run(self):
        """Exécute l'ajout des données de test."""
        try:
            self.connect_neo4j()
            self.add_test_regions()
            self.add_test_dialectes()
            logger.info("🎉 Ajout des données de test terminé avec succès !")
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'ajout des données de test: {e}")
            raise
        finally:
            if self.driver:
                self.driver.close()

if __name__ == "__main__":
    adder = TestDataAdder()
    adder.run() 