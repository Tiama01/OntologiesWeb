#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MIGRATION ONTOLOGIE OWL VERS NEO4J
Conversion de l'ontologie ethnolinguistique du Burkina Faso
"""

import sys
import json
from typing import Dict, List, Any, Optional
from rdflib import Graph, Namespace, URIRef, Literal
from neo4j import GraphDatabase
import logging

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OntologieToNeo4j:
    """Migration de l'ontologie OWL vers Neo4j."""
    
    def __init__(self, neo4j_uri: str = "bolt://localhost:7687", 
                 username: str = "neo4j", password: str = "password"):
        self.neo4j_uri = neo4j_uri
        self.username = username
        self.password = password
        self.driver = None
        self.graph = Graph()
        self.ns = Namespace("http://www.semanticweb.org/ontologie/burkina-faso#")
        
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
    
    def load_ontology(self, owl_file: str = "ontologie_burkina_faso.owl"):
        """Charge l'ontologie OWL."""
        try:
            self.graph.parse(owl_file, format="xml")
            logger.info(f"✅ Ontologie chargée: {len(self.graph)} triples")
        except Exception as e:
            logger.error(f"❌ Erreur chargement ontologie: {e}")
            raise
    
    def create_constraints(self):
        """Crée les contraintes et index Neo4j."""
        with self.driver.session() as session:
            # Contraintes d'unicité
            constraints = [
                "CREATE CONSTRAINT ethnie_nom IF NOT EXISTS FOR (e:Ethnie) REQUIRE e.nom IS UNIQUE",
                "CREATE CONSTRAINT langue_nom IF NOT EXISTS FOR (l:Langue) REQUIRE l.nom IS UNIQUE",
                "CREATE CONSTRAINT localite_nom IF NOT EXISTS FOR (loc:Localite) REQUIRE loc.nom IS UNIQUE",
                "CREATE CONSTRAINT patronyme_nom IF NOT EXISTS FOR (p:Patronyme) REQUIRE p.nom IS UNIQUE",
                "CREATE CONSTRAINT dialecte_nom IF NOT EXISTS FOR (d:Dialecte) REQUIRE d.nom IS UNIQUE",
                "CREATE CONSTRAINT region_nom IF NOT EXISTS FOR (r:Region) REQUIRE r.nom IS UNIQUE",
                "CREATE CONSTRAINT famille_nom IF NOT EXISTS FOR (f:FamilleLinguistique) REQUIRE f.nom IS UNIQUE"
            ]
            
            for constraint in constraints:
                try:
                    session.run(constraint)
                    logger.info(f"✅ Contrainte créée: {constraint}")
                except Exception as e:
                    logger.warning(f"⚠️ Contrainte déjà existante: {e}")
    
    def migrate_ethnies(self):
        """Migration des ethnies."""
        query = """
        PREFIX ont: <http://www.semanticweb.org/ontologie/burkina-faso#>
        SELECT DISTINCT ?ethnie ?nom ?synonyme ?description ?tradition ?population ?pourcentage ?statut WHERE {
            ?ethnie a ont:Ethnie .
            ?ethnie ont:nom ?nom .
            OPTIONAL { ?ethnie ont:synonyme ?synonyme }
            OPTIONAL { ?ethnie ont:description ?description }
            OPTIONAL { ?ethnie ont:tradition ?tradition }
            OPTIONAL { ?ethnie ont:populationEstimee ?population }
            OPTIONAL { ?ethnie ont:pourcentageNational ?pourcentage }
            OPTIONAL { ?ethnie ont:statutNational ?statut }
        }
        """
        
        results = self.graph.query(query)
        with self.driver.session() as session:
            for row in results:
                nom = str(row.get("nom", ""))
                if not nom:
                    continue
                
                # Création du nœud Ethnie
                cypher_query = """
                MERGE (e:Ethnie {nom: $nom})
                SET e.synonyme = $synonyme,
                    e.description = $description,
                    e.tradition = $tradition,
                    e.population_estimee = $population,
                    e.pourcentage_national = $pourcentage,
                    e.statut_national = $statut
                """
                
                session.run(cypher_query, {
                    'nom': nom,
                    'synonyme': str(row.get("synonyme", "")) if row.get("synonyme") else None,
                    'description': str(row.get("description", "")) if row.get("description") else None,
                    'tradition': str(row.get("tradition", "")) if row.get("tradition") else None,
                    'population': int(row.get("population")) if row.get("population") else None,
                    'pourcentage': float(row.get("pourcentage")) if row.get("pourcentage") else None,
                    'statut': str(row.get("statut", "")).split("#")[-1] if row.get("statut") else None
                })
        
        logger.info("✅ Ethnies migrées")
    
    def migrate_langues(self):
        """Migration des langues."""
        query = """
        PREFIX ont: <http://www.semanticweb.org/ontologie/burkina-faso#>
        SELECT DISTINCT ?langue ?nom ?description ?locuteurs ?famille_nom WHERE {
            ?langue a ont:Langue .
            ?langue ont:nom ?nom .
            OPTIONAL { ?langue ont:description ?description }
            OPTIONAL { ?langue ont:nombreLocuteur ?locuteurs }
            OPTIONAL { 
                ?langue ont:aPourFamilleLinguistique ?famille .
                ?famille ont:nom ?famille_nom 
            }
        }
        """
        
        results = self.graph.query(query)
        with self.driver.session() as session:
            for row in results:
                nom = str(row.get("nom", ""))
                if not nom:
                    continue
                
                # Création du nœud Langue
                cypher_query = """
                MERGE (l:Langue {nom: $nom})
                SET l.description = $description,
                    l.nombre_locuteurs = $locuteurs,
                    l.famille_linguistique = $famille
                """
                
                session.run(cypher_query, {
                    'nom': nom,
                    'description': str(row.get("description", "")) if row.get("description") else None,
                    'locuteurs': int(row.get("locuteurs")) if row.get("locuteurs") else None,
                    'famille': str(row.get("famille_nom", "")) if row.get("famille_nom") else None
                })
        
        logger.info("✅ Langues migrées")
    
    def migrate_localites(self):
        """Migration des localités/régions."""
        query = """
        PREFIX ont: <http://www.semanticweb.org/ontologie/burkina-faso#>
        SELECT DISTINCT ?localite ?nom ?description ?latitude ?longitude WHERE {
            ?localite a ont:Localite .
            ?localite ont:nom ?nom .
            OPTIONAL { ?localite ont:description ?description }
            OPTIONAL { ?localite ont:latitude ?latitude }
            OPTIONAL { ?localite ont:longitude ?longitude }
        }
        """
        
        results = self.graph.query(query)
        with self.driver.session() as session:
            for row in results:
                nom = str(row.get("nom", ""))
                if not nom:
                    continue
                
                # Création du nœud Localite
                cypher_query = """
                MERGE (loc:Localite {nom: $nom})
                SET loc.description = $description,
                    loc.latitude = $latitude,
                    loc.longitude = $longitude
                """
                
                session.run(cypher_query, {
                    'nom': nom,
                    'description': str(row.get("description", "")) if row.get("description") else None,
                    'latitude': float(row.get("latitude")) if row.get("latitude") else None,
                    'longitude': float(row.get("longitude")) if row.get("longitude") else None
                })
        
        logger.info("✅ Localités migrées")
    
    def migrate_patronymes(self):
        """Migration des patronymes."""
        query = """
        PREFIX ont: <http://www.semanticweb.org/ontologie/burkina-faso#>
        SELECT DISTINCT ?patronyme ?nom ?signification ?origine ?ethnie_nom WHERE {
            ?patronyme a ont:Patronyme .
            ?patronyme ont:nom ?nom .
            OPTIONAL { ?patronyme ont:signification ?signification }
            OPTIONAL { ?patronyme ont:origine ?origine }
            OPTIONAL { 
                ?patronyme ont:aPourEthnie ?ethnie .
                ?ethnie ont:nom ?ethnie_nom 
            }
        }
        """
        
        results = self.graph.query(query)
        with self.driver.session() as session:
            for row in results:
                nom = str(row.get("nom", ""))
                if not nom:
                    continue
                
                # Création du nœud Patronyme
                cypher_query = """
                MERGE (p:Patronyme {nom: $nom})
                SET p.signification = $signification,
                    p.origine = $origine,
                    p.ethnie = $ethnie
                """
                
                session.run(cypher_query, {
                    'nom': nom,
                    'signification': str(row.get("signification", "")) if row.get("signification") else None,
                    'origine': str(row.get("origine", "")) if row.get("origine") else None,
                    'ethnie': str(row.get("ethnie_nom", "")) if row.get("ethnie_nom") else None
                })
        
        logger.info("✅ Patronymes migrés")
    
    def migrate_regions(self):
        """Migration des régions."""
        query = """
        PREFIX ont: <http://www.semanticweb.org/ontologie/burkina-faso#>
        SELECT DISTINCT ?region ?nom ?description ?latitude ?longitude ?ethnies_majoritaires WHERE {
            ?region a ont:Region .
            ?region ont:nom ?nom .
            OPTIONAL { ?region ont:description ?description }
            OPTIONAL { ?region ont:latitude ?latitude }
            OPTIONAL { ?region ont:longitude ?longitude }
            OPTIONAL { ?region ont:ethniesMajoritaires ?ethnies_majoritaires }
        }
        """
        
        results = self.graph.query(query)
        with self.driver.session() as session:
            for row in results:
                nom = str(row.get("nom", ""))
                if not nom:
                    continue
                
                # Création du nœud Region
                cypher_query = """
                MERGE (r:Region {nom: $nom})
                SET r.description = $description,
                    r.latitude = $latitude,
                    r.longitude = $longitude,
                    r.ethnies_majoritaires = $ethnies_majoritaires
                """
                
                # Conversion des coordonnées en float si possible
                try:
                    lat = float(row.get("latitude", 0)) if row.get("latitude") else None
                    lon = float(row.get("longitude", 0)) if row.get("longitude") else None
                except (ValueError, TypeError):
                    lat = None
                    lon = None
                
                session.run(cypher_query, {
                    "nom": nom,
                    "description": str(row.get("description", "")) if row.get("description") else None,
                    "latitude": lat,
                    "longitude": lon,
                    "ethnies_majoritaires": str(row.get("ethnies_majoritaires", "")) if row.get("ethnies_majoritaires") else None
                })
                
                logger.info(f"✅ Région migrée: {nom}")
        
        logger.info("✅ Migration des régions terminée")
    
    def migrate_dialectes(self):
        """Migration des dialectes."""
        query = """
        PREFIX ont: <http://www.semanticweb.org/ontologie/burkina-faso#>
        SELECT DISTINCT ?dialecte ?nom ?description ?langue_principale ?localite WHERE {
            ?dialecte a ont:Dialecte .
            ?dialecte ont:nom ?nom .
            OPTIONAL { ?dialecte ont:description ?description }
            OPTIONAL { ?dialecte ont:languePrincipale ?langue_principale }
            OPTIONAL { ?dialecte ont:localite ?localite }
        }
        """
        
        results = self.graph.query(query)
        with self.driver.session() as session:
            for row in results:
                nom = str(row.get("nom", ""))
                if not nom:
                    continue
                
                # Création du nœud Dialecte
                cypher_query = """
                MERGE (d:Dialecte {nom: $nom})
                SET d.description = $description,
                    d.langue_principale = $langue_principale,
                    d.localite = $localite
                """
                
                session.run(cypher_query, {
                    "nom": nom,
                    "description": str(row.get("description", "")) if row.get("description") else None,
                    "langue_principale": str(row.get("langue_principale", "")) if row.get("langue_principale") else None,
                    "localite": str(row.get("localite", "")) if row.get("localite") else None
                })
                
                logger.info(f"✅ Dialecte migré: {nom}")
        
        logger.info("✅ Migration des dialectes terminée")
    
    def create_relationships(self):
        """Crée les relations entre les nœuds."""
        with self.driver.session() as session:
            # Relations Ethnie -> Localite
            session.run("""
            MATCH (e:Ethnie), (loc:Localite)
            WHERE e.nom = loc.nom OR e.nom IN split(loc.description, ' ')
            MERGE (e)-[:EST_LOCALISE]->(loc)
            """)
            
            # Relations Patronyme -> Ethnie
            session.run("""
            MATCH (p:Patronyme), (e:Ethnie)
            WHERE p.ethnie = e.nom
            MERGE (p)-[:APPARTIENT_A]->(e)
            """)
            
            # Relations Langue -> Famille Linguistique
            session.run("""
            MATCH (l:Langue)
            WHERE l.famille_linguistique IS NOT NULL
            MERGE (f:FamilleLinguistique {nom: l.famille_linguistique})
            MERGE (l)-[:APPARTIENT_A]->(f)
            """)
            
            logger.info("✅ Relations créées")
    
    def migrate_all(self):
        """Migration complète."""
        logger.info("🚀 Début de la migration vers Neo4j...")
        
        try:
            # Connexion et préparation
            self.connect_neo4j()
            self.load_ontology()
            self.create_constraints()
            
            # Migration des données
            self.migrate_ethnies()
            self.migrate_langues()
            self.migrate_localites()
            self.migrate_patronymes()
            self.migrate_regions()
            self.migrate_dialectes()
            
            # Création des relations
            self.create_relationships()
            
            logger.info("🎉 Migration terminée avec succès !")
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la migration: {e}")
            raise
        finally:
            if self.driver:
                self.driver.close()

def main():
    """Point d'entrée principal."""
    # Configuration Neo4j (à adapter selon votre installation)
    neo4j_uri = "bolt://localhost:7687"
    username = "neo4j"
    password = "ontologie2024"  # Mot de passe configuré pour le projet
    
    migrator = OntologieToNeo4j(neo4j_uri, username, password)
    migrator.migrate_all()

if __name__ == "__main__":
    main() 