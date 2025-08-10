#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SERVICE NEO4J POUR ONTOLOGIE ETHNOLINGUISTIQUE
Service de gestion des données avec Neo4j
"""

from typing import Dict, List, Any, Optional
from neo4j import GraphDatabase
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class Neo4jService:
    """Service de gestion des données avec Neo4j."""
    
    def __init__(self, uri: str = "bolt://localhost:7687", 
                 username: str = "neo4j", password: str = "ontologie2024"):
        self.uri = uri
        self.username = username
        self.password = password
        self.driver = None
        
    def connect(self):
        """Connexion à Neo4j."""
        try:
            self.driver = GraphDatabase.driver(self.uri, 
                                             auth=(self.username, self.password))
            # Test de connexion
            with self.driver.session() as session:
                result = session.run("RETURN 1 as test")
                logger.info("✅ Connexion Neo4j réussie")
        except Exception as e:
            logger.error(f"❌ Erreur connexion Neo4j: {e}")
            raise
    
    def close(self):
        """Fermeture de la connexion."""
        if self.driver:
            self.driver.close()
    
    def get_ethnies(self) -> List[Dict[str, Any]]:
        """Récupère toutes les ethnies."""
        with self.driver.session() as session:
            query = """
            MATCH (e:Ethnie)
            RETURN e.nom as nom,
                   e.synonyme as synonyme,
                   e.description as description,
                   e.tradition as tradition,
                   e.population_estimee as population,
                   e.pourcentage_national as pourcentage,
                   e.statut_national as statut
            ORDER BY e.nom
            """
            result = session.run(query)
            return [dict(record) for record in result]
    
    def get_ethnie_by_name(self, nom: str) -> Optional[Dict[str, Any]]:
        """Récupère une ethnie par son nom."""
        with self.driver.session() as session:
            query = """
            MATCH (e:Ethnie {nom: $nom})
            OPTIONAL MATCH (e)-[:EST_LOCALISE]->(loc:Localite)
            OPTIONAL MATCH (p:Patronyme)-[:APPARTIENT_A]->(e)
            RETURN e.nom as nom,
                   e.synonyme as synonyme,
                   e.description as description,
                   e.tradition as tradition,
                   e.population_estimee as population,
                   e.pourcentage_national as pourcentage,
                   e.statut_national as statut,
                   collect(DISTINCT loc.nom) as localites,
                   collect(DISTINCT p.nom) as patronymes
            """
            result = session.run(query, nom=nom)
            record = result.single()
            return dict(record) if record else None
    
    def get_langues(self) -> List[Dict[str, Any]]:
        """Récupère toutes les langues."""
        with self.driver.session() as session:
            query = """
            MATCH (l:Langue)
            OPTIONAL MATCH (l)-[:APPARTIENT_A]->(f:FamilleLinguistique)
            RETURN l.nom as nom,
                   l.description as description,
                   l.nombre_locuteurs as locuteurs,
                   f.nom as famille_linguistique
            ORDER BY l.nom
            """
            result = session.run(query)
            return [dict(record) for record in result]
    
    def get_langue_by_name(self, nom: str) -> Optional[Dict[str, Any]]:
        """Récupère une langue par son nom."""
        with self.driver.session() as session:
            query = """
            MATCH (l:Langue {nom: $nom})
            OPTIONAL MATCH (l)-[:APPARTIENT_A]->(f:FamilleLinguistique)
            RETURN l.nom as nom,
                   l.description as description,
                   l.nombre_locuteurs as locuteurs,
                   f.nom as famille_linguistique
            """
            result = session.run(query, nom=nom)
            record = result.single()
            return dict(record) if record else None
    
    def get_localites(self) -> List[Dict[str, Any]]:
        """Récupère toutes les localités."""
        with self.driver.session() as session:
            query = """
            MATCH (loc:Localite)
            OPTIONAL MATCH (e:Ethnie)-[:EST_LOCALISE]->(loc)
            RETURN loc.nom as nom,
                   loc.description as description,
                   loc.latitude as latitude,
                   loc.longitude as longitude,
                   collect(DISTINCT e.nom) as ethnies
            ORDER BY loc.nom
            """
            result = session.run(query)
            return [dict(record) for record in result]
    
    def get_localite_by_name(self, nom: str) -> Optional[Dict[str, Any]]:
        """Récupère une localité par son nom."""
        with self.driver.session() as session:
            query = """
            MATCH (loc:Localite {nom: $nom})
            OPTIONAL MATCH (e:Ethnie)-[:EST_LOCALISE]->(loc)
            RETURN loc.nom as nom,
                   loc.description as description,
                   loc.latitude as latitude,
                   loc.longitude as longitude,
                   collect(DISTINCT e.nom) as ethnies
            """
            result = session.run(query, nom=nom)
            record = result.single()
            return dict(record) if record else None
    
    def get_patronymes(self) -> List[Dict[str, Any]]:
        """Récupère tous les patronymes."""
        with self.driver.session() as session:
            query = """
            MATCH (p:Patronyme)
            OPTIONAL MATCH (p)-[:APPARTIENT_A]->(e:Ethnie)
            RETURN p.nom as nom,
                   p.signification as signification,
                   p.origine as origine,
                   e.nom as ethnie
            ORDER BY p.nom
            """
            result = session.run(query)
            return [dict(record) for record in result]
    
    def get_patronyme_by_name(self, nom: str) -> Optional[Dict[str, Any]]:
        """Récupère un patronyme par son nom."""
        with self.driver.session() as session:
            query = """
            MATCH (p:Patronyme {nom: $nom})
            OPTIONAL MATCH (p)-[:APPARTIENT_A]->(e:Ethnie)
            RETURN p.nom as nom,
                   p.signification as signification,
                   p.origine as origine,
                   e.nom as ethnie
            """
            result = session.run(query, nom=nom)
            record = result.single()
            return dict(record) if record else None
    
    def get_familles_linguistiques(self) -> List[Dict[str, Any]]:
        """Récupère toutes les familles linguistiques."""
        with self.driver.session() as session:
            query = """
            MATCH (f:FamilleLinguistique)
            OPTIONAL MATCH (l:Langue)-[:APPARTIENT_A]->(f)
            RETURN f.nom as nom,
                   collect(DISTINCT l.nom) as langues,
                   size(collect(DISTINCT l)) as nombre_langues
            ORDER BY f.nom
            """
            result = session.run(query)
            return [dict(record) for record in result]
    
    def search_entities(self, search_term: str) -> Dict[str, List[Dict[str, Any]]]:
        """Recherche d'entités par terme."""
        with self.driver.session() as session:
            # Recherche dans les ethnies
            ethnie_query = """
            MATCH (e:Ethnie)
            WHERE toLower(e.nom) CONTAINS toLower($search_term)
               OR toLower(e.synonyme) CONTAINS toLower($search_term)
               OR toLower(e.description) CONTAINS toLower($search_term)
            RETURN 'ethnie' as type, e.nom as nom, e.description as description
            LIMIT 10
            """
            
            # Recherche dans les langues
            langue_query = """
            MATCH (l:Langue)
            WHERE toLower(l.nom) CONTAINS toLower($search_term)
               OR toLower(l.description) CONTAINS toLower($search_term)
            RETURN 'langue' as type, l.nom as nom, l.description as description
            LIMIT 10
            """
            
            # Recherche dans les localités
            localite_query = """
            MATCH (loc:Localite)
            WHERE toLower(loc.nom) CONTAINS toLower($search_term)
               OR toLower(loc.description) CONTAINS toLower($search_term)
            RETURN 'localite' as type, loc.nom as nom, loc.description as description
            LIMIT 10
            """
            
            # Recherche dans les patronymes
            patronyme_query = """
            MATCH (p:Patronyme)
            WHERE toLower(p.nom) CONTAINS toLower($search_term)
               OR toLower(p.signification) CONTAINS toLower($search_term)
            RETURN 'patronyme' as type, p.nom as nom, p.signification as description
            LIMIT 10
            """
            
            results = {
                'ethnies': [dict(record) for record in session.run(ethnie_query, search_term=search_term)],
                'langues': [dict(record) for record in session.run(langue_query, search_term=search_term)],
                'localites': [dict(record) for record in session.run(localite_query, search_term=search_term)],
                'patronymes': [dict(record) for record in session.run(patronyme_query, search_term=search_term)]
            }
            
            return results
    
    def get_statistics(self) -> Dict[str, Any]:
        """Récupère les statistiques générales."""
        with self.driver.session() as session:
            query = """
            MATCH (e:Ethnie) RETURN count(e) as ethnies
            UNION
            MATCH (l:Langue) RETURN count(l) as langues
            UNION
            MATCH (loc:Localite) RETURN count(loc) as localites
            UNION
            MATCH (p:Patronyme) RETURN count(p) as patronymes
            UNION
            MATCH (f:FamilleLinguistique) RETURN count(f) as familles
            """
            result = session.run(query)
            stats = {}
            for record in result:
                for key, value in record.items():
                    stats[key] = value
            return stats
    
    def get_ethnies_par_region(self) -> List[Dict[str, Any]]:
        """Récupère les ethnies groupées par région."""
        with self.driver.session() as session:
            query = """
            MATCH (loc:Localite)
            OPTIONAL MATCH (e:Ethnie)-[:EST_LOCALISE]->(loc)
            WITH loc, collect(DISTINCT e) as ethnies
            RETURN loc.nom as region,
                   loc.description as description_region,
                   loc.latitude as latitude,
                   loc.longitude as longitude,
                   [ethnie IN ethnies WHERE ethnie IS NOT NULL | {
                       nom: ethnie.nom,
                       synonyme: ethnie.synonyme,
                       description: ethnie.description,
                       population_estimee: ethnie.population_estimee,
                       pourcentage_national: ethnie.pourcentage_national,
                       statut_national: ethnie.statut_national
                   }] as ethnies
            ORDER BY loc.nom
            """
            result = session.run(query)
            return [dict(record) for record in result]
    
    def get_relationships_graph(self) -> Dict[str, Any]:
        """Récupère le graphe des relations pour visualisation."""
        with self.driver.session() as session:
            query = """
            MATCH (n)
            OPTIONAL MATCH (n)-[r]->(m)
            RETURN DISTINCT
                   labels(n)[0] as source_type,
                   n.nom as source_name,
                   type(r) as relationship,
                   labels(m)[0] as target_type,
                   m.nom as target_name
            LIMIT 100
            """
            result = session.run(query)
            nodes = set()
            edges = []
            
            for record in result:
                source = f"{record['source_type']}:{record['source_name']}"
                target = f"{record['target_type']}:{record['target_name']}"
                
                nodes.add(source)
                nodes.add(target)
                
                if record['relationship']:
                    edges.append({
                        'source': source,
                        'target': target,
                        'relationship': record['relationship']
                    })
            
            return {
                'nodes': [{'id': node, 'type': node.split(':')[0], 'name': node.split(':')[1]} 
                         for node in nodes],
                'edges': edges
            }
    
    def add_ethnie(self, data: Dict[str, Any]) -> bool:
        """Ajoute une nouvelle ethnie."""
        with self.driver.session() as session:
            query = """
            CREATE (e:Ethnie {
                nom: $nom,
                synonyme: $synonyme,
                description: $description,
                tradition: $tradition,
                population_estimee: $population,
                pourcentage_national: $pourcentage,
                statut_national: $statut
            })
            """
            try:
                session.run(query, **data)
                return True
            except Exception as e:
                logger.error(f"Erreur ajout ethnie: {e}")
                return False
    
    def update_ethnie(self, nom: str, data: Dict[str, Any]) -> bool:
        """Met à jour une ethnie existante."""
        with self.driver.session() as session:
            query = """
            MATCH (e:Ethnie {nom: $nom})
            SET e.synonyme = $synonyme,
                e.description = $description,
                e.tradition = $tradition,
                e.population_estimee = $population,
                e.pourcentage_national = $pourcentage,
                e.statut_national = $statut
            """
            try:
                session.run(query, nom=nom, **data)
                return True
            except Exception as e:
                logger.error(f"Erreur mise à jour ethnie: {e}")
                return False
    
    def delete_ethnie(self, nom: str) -> bool:
        """Supprime une ethnie."""
        with self.driver.session() as session:
            query = """
            MATCH (e:Ethnie {nom: $nom})
            DETACH DELETE e
            """
            try:
                session.run(query, nom=nom)
                return True
            except Exception as e:
                logger.error(f"Erreur suppression ethnie: {e}")
                return False 

    def add_langue(self, data: Dict[str, Any]) -> bool:
        """Ajoute une nouvelle langue."""
        try:
            with self.driver.session() as session:
                query = """
                CREATE (l:Langue {
                    nom: $nom,
                    description: $description,
                    nombre_locuteurs: $nombre_locuteurs,
                    famille_linguistique: $famille_linguistique
                })
                """
                session.run(query, **data)
                logger.info(f"✅ Langue {data['nom']} ajoutée")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur ajout langue {data['nom']}: {e}")
            return False

    def update_langue(self, nom: str, data: Dict[str, Any]) -> bool:
        """Met à jour une langue existante."""
        try:
            with self.driver.session() as session:
                # Construire la requête dynamiquement
                set_clauses = []
                params = {"nom": nom}
                
                for key, value in data.items():
                    if value is not None:
                        set_clauses.append(f"l.{key} = ${key}")
                        params[key] = value
                
                if not set_clauses:
                    return False
                
                query = f"""
                MATCH (l:Langue {{nom: $nom}})
                SET {', '.join(set_clauses)}
                RETURN l
                """
                result = session.run(query, **params)
                return result.single() is not None
        except Exception as e:
            logger.error(f"❌ Erreur mise à jour langue {nom}: {e}")
            return False

    def delete_langue(self, nom: str) -> bool:
        """Supprime une langue."""
        try:
            with self.driver.session() as session:
                query = """
                MATCH (l:Langue {nom: $nom})
                DETACH DELETE l
                """
                session.run(query, nom=nom)
                logger.info(f"✅ Langue {nom} supprimée")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur suppression langue {nom}: {e}")
            return False

    def add_patronyme(self, data: Dict[str, Any]) -> bool:
        """Ajoute un nouveau patronyme."""
        try:
            with self.driver.session() as session:
                query = """
                CREATE (p:Patronyme {
                    nom: $nom,
                    signification: $signification,
                    origine: $origine
                })
                """
                session.run(query, **data)
                
                # Créer la relation avec l'ethnie si spécifiée
                if data.get('ethnie'):
                    query_relation = """
                    MATCH (p:Patronyme {nom: $patronyme})
                    MATCH (e:Ethnie {nom: $ethnie})
                    CREATE (p)-[:APPARTIENT_A]->(e)
                    """
                    session.run(query_relation, patronyme=data['nom'], ethnie=data['ethnie'])
                
                logger.info(f"✅ Patronyme {data['nom']} ajouté")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur ajout patronyme {data['nom']}: {e}")
            return False

    def update_patronyme(self, nom: str, data: Dict[str, Any]) -> bool:
        """Met à jour un patronyme existant."""
        try:
            with self.driver.session() as session:
                # Construire la requête dynamiquement
                set_clauses = []
                params = {"nom": nom}
                
                for key, value in data.items():
                    if value is not None:
                        set_clauses.append(f"p.{key} = ${key}")
                        params[key] = value
                
                if not set_clauses:
                    return False
                
                query = f"""
                MATCH (p:Patronyme {{nom: $nom}})
                SET {', '.join(set_clauses)}
                RETURN p
                """
                result = session.run(query, **params)
                return result.single() is not None
        except Exception as e:
            logger.error(f"❌ Erreur mise à jour patronyme {nom}: {e}")
            return False

    def delete_patronyme(self, nom: str) -> bool:
        """Supprime un patronyme."""
        try:
            with self.driver.session() as session:
                query = """
                MATCH (p:Patronyme {nom: $nom})
                DETACH DELETE p
                """
                session.run(query, nom=nom)
                logger.info(f"✅ Patronyme {nom} supprimé")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur suppression patronyme {nom}: {e}")
            return False

    def add_dialecte(self, data: Dict[str, Any]) -> bool:
        """Ajoute un nouveau dialecte."""
        try:
            with self.driver.session() as session:
                query = """
                CREATE (d:Dialecte {
                    nom: $nom,
                    description: $description,
                    langue_principale: $langue_principale,
                    localite: $localite
                })
                """
                session.run(query, **data)
                
                # Créer la relation avec la langue si spécifiée
                if data.get('langue_principale'):
                    query_relation = """
                    MATCH (d:Dialecte {nom: $dialecte})
                    MATCH (l:Langue {nom: $langue})
                    CREATE (d)-[:VARIANTE_DE]->(l)
                    """
                    session.run(query_relation, dialecte=data['nom'], langue=data['langue_principale'])
                
                logger.info(f"✅ Dialecte {data['nom']} ajouté")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur ajout dialecte {data['nom']}: {e}")
            return False

    def update_dialecte(self, nom: str, data: Dict[str, Any]) -> bool:
        """Met à jour un dialecte existant."""
        try:
            with self.driver.session() as session:
                # Construire la requête dynamiquement
                set_clauses = []
                params = {"nom": nom}
                
                for key, value in data.items():
                    if value is not None:
                        set_clauses.append(f"d.{key} = ${key}")
                        params[key] = value
                
                if not set_clauses:
                    return False
                
                query = f"""
                MATCH (d:Dialecte {{nom: $nom}})
                SET {', '.join(set_clauses)}
                RETURN d
                """
                result = session.run(query, **params)
                return result.single() is not None
        except Exception as e:
            logger.error(f"❌ Erreur mise à jour dialecte {nom}: {e}")
            return False

    def delete_dialecte(self, nom: str) -> bool:
        """Supprime un dialecte."""
        try:
            with self.driver.session() as session:
                query = """
                MATCH (d:Dialecte {nom: $nom})
                DETACH DELETE d
                """
                session.run(query, nom=nom)
                logger.info(f"✅ Dialecte {nom} supprimé")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur suppression dialecte {nom}: {e}")
            return False

    def add_region(self, data: Dict[str, Any]) -> bool:
        """Ajoute une nouvelle région."""
        try:
            with self.driver.session() as session:
                query = """
                CREATE (r:Region {
                    nom: $nom,
                    description: $description,
                    latitude: $latitude,
                    longitude: $longitude,
                    ethnies_majoritaires: $ethnies_majoritaires
                })
                """
                session.run(query, **data)
                logger.info(f"✅ Région {data['nom']} ajoutée")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur ajout région {data['nom']}: {e}")
            return False

    def update_region(self, nom: str, data: Dict[str, Any]) -> bool:
        """Met à jour une région existante."""
        try:
            with self.driver.session() as session:
                # Construire la requête dynamiquement
                set_clauses = []
                params = {"nom": nom}
                
                for key, value in data.items():
                    if value is not None:
                        set_clauses.append(f"r.{key} = ${key}")
                        params[key] = value
                
                if not set_clauses:
                    return False
                
                query = f"""
                MATCH (r:Region {{nom: $nom}})
                SET {', '.join(set_clauses)}
                RETURN r
                """
                result = session.run(query, **params)
                return result.single() is not None
        except Exception as e:
            logger.error(f"❌ Erreur mise à jour région {nom}: {e}")
            return False

    def delete_region(self, nom: str) -> bool:
        """Supprime une région."""
        try:
            with self.driver.session() as session:
                query = """
                MATCH (r:Region {nom: $nom})
                DETACH DELETE r
                """
                session.run(query, nom=nom)
                logger.info(f"✅ Région {nom} supprimée")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur suppression région {nom}: {e}")
            return False

    def add_famille_linguistique(self, data: Dict[str, Any]) -> bool:
        """Ajoute une nouvelle famille linguistique."""
        try:
            with self.driver.session() as session:
                query = """
                CREATE (f:FamilleLinguistique {
                    nom: $nom,
                    origine_geographique: $origine_geographique,
                    description: $description,
                    nombre_total_locuteurs: $nombre_total_locuteurs
                })
                """
                session.run(query, **data)
                logger.info(f"✅ Famille linguistique {data['nom']} ajoutée")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur ajout famille linguistique {data['nom']}: {e}")
            return False

    def update_famille_linguistique(self, nom: str, data: Dict[str, Any]) -> bool:
        """Met à jour une famille linguistique existante."""
        try:
            with self.driver.session() as session:
                # Construire la requête dynamiquement
                set_clauses = []
                params = {"nom": nom}
                
                for key, value in data.items():
                    if value is not None:
                        set_clauses.append(f"f.{key} = ${key}")
                        params[key] = value
                
                if not set_clauses:
                    return False
                
                query = f"""
                MATCH (f:FamilleLinguistique {{nom: $nom}})
                SET {', '.join(set_clauses)}
                RETURN f
                """
                result = session.run(query, **params)
                return result.single() is not None
        except Exception as e:
            logger.error(f"❌ Erreur mise à jour famille linguistique {nom}: {e}")
            return False

    def delete_famille_linguistique(self, nom: str) -> bool:
        """Supprime une famille linguistique."""
        try:
            with self.driver.session() as session:
                query = """
                MATCH (f:FamilleLinguistique {nom: $nom})
                DETACH DELETE f
                """
                session.run(query, nom=nom)
                logger.info(f"✅ Famille linguistique {nom} supprimée")
                return True
        except Exception as e:
            logger.error(f"❌ Erreur suppression famille linguistique {nom}: {e}")
            return False 

    def get_regions(self) -> List[Dict[str, Any]]:
        """Récupère toutes les régions (basées sur les localités)."""
        with self.driver.session() as session:
            query = """
            MATCH (loc:Localite)
            RETURN loc.nom as nom,
                   loc.description as description,
                   loc.latitude as latitude,
                   loc.longitude as longitude,
                   'Localité du Burkina Faso' as ethnies_majoritaires
            ORDER BY loc.nom
            """
            result = session.run(query)
            return [dict(record) for record in result]

    def get_region_by_name(self, nom: str) -> Optional[Dict[str, Any]]:
        """Récupère une région par son nom (basée sur les localités)."""
        with self.driver.session() as session:
            query = """
            MATCH (loc:Localite {nom: $nom})
            OPTIONAL MATCH (e:Ethnie)-[:EST_LOCALISE]->(loc)
            RETURN loc.nom as nom,
                   loc.description as description,
                   loc.latitude as latitude,
                   loc.longitude as longitude,
                   'Localité du Burkina Faso' as ethnies_majoritaires,
                   collect(DISTINCT e.nom) as ethnies
            """
            result = session.run(query, nom=nom)
            record = result.single()
            return dict(record) if record else None

    def get_dialectes(self) -> List[Dict[str, Any]]:
        """Récupère tous les dialectes."""
        with self.driver.session() as session:
            query = """
            MATCH (d:Dialecte)
            OPTIONAL MATCH (d)-[:VARIANTE_DE]->(l:Langue)
            RETURN d.nom as nom,
                   d.description as description,
                   d.langue_principale as langue_principale,
                   d.localite as localite,
                   l.nom as langue
            ORDER BY d.nom
            """
            result = session.run(query)
            return [dict(record) for record in result]

    def get_dialecte_by_name(self, nom: str) -> Optional[Dict[str, Any]]:
        """Récupère un dialecte par son nom."""
        with self.driver.session() as session:
            query = """
            MATCH (d:Dialecte {nom: $nom})
            OPTIONAL MATCH (d)-[:VARIANTE_DE]->(l:Langue)
            RETURN d.nom as nom,
                   d.description as description,
                   d.langue_principale as langue_principale,
                   d.localite as localite,
                   l.nom as langue
            """
            result = session.run(query, nom=nom)
            record = result.single()
            return dict(record) if record else None 