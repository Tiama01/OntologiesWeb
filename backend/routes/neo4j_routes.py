#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ROUTES NEO4J POUR ONTOLOGIE ETHNOLINGUISTIQUE
Routes FastAPI utilisant Neo4j comme base de données
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import logging
from services.neo4j_service import Neo4jService

logger = logging.getLogger(__name__)

# Modèles Pydantic
class EthnieCreate(BaseModel):
    nom: str
    synonyme: Optional[str] = None
    description: Optional[str] = None
    tradition: Optional[str] = None
    population_estimee: Optional[int] = None
    pourcentage_national: Optional[float] = None
    statut_national: Optional[str] = None

class EthnieUpdate(BaseModel):
    synonyme: Optional[str] = None
    description: Optional[str] = None
    tradition: Optional[str] = None
    population_estimee: Optional[int] = None
    pourcentage_national: Optional[float] = None
    statut_national: Optional[str] = None

class LangueCreate(BaseModel):
    nom: str
    description: Optional[str] = None
    nombre_locuteurs: Optional[int] = None
    famille_linguistique: Optional[str] = None

class LangueUpdate(BaseModel):
    description: Optional[str] = None
    nombre_locuteurs: Optional[int] = None
    famille_linguistique: Optional[str] = None

class DialecteCreate(BaseModel):
    nom: str
    description: Optional[str] = None
    langue_principale: Optional[str] = None
    localite: Optional[str] = None

class DialecteUpdate(BaseModel):
    description: Optional[str] = None
    langue_principale: Optional[str] = None
    localite: Optional[str] = None

class RegionCreate(BaseModel):
    nom: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ethnies_majoritaires: Optional[str] = None

class RegionUpdate(BaseModel):
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ethnies_majoritaires: Optional[str] = None

class FamilleLinguistiqueCreate(BaseModel):
    nom: str
    origine_geographique: Optional[str] = None
    description: Optional[str] = None
    nombre_total_locuteurs: Optional[int] = None

class FamilleLinguistiqueUpdate(BaseModel):
    origine_geographique: Optional[str] = None
    description: Optional[str] = None
    nombre_total_locuteurs: Optional[int] = None

class LocaliteCreate(BaseModel):
    nom: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PatronymeCreate(BaseModel):
    nom: str
    signification: Optional[str] = None
    origine: Optional[str] = None
    ethnie: Optional[str] = None

class PatronymeUpdate(BaseModel):
    signification: Optional[str] = None
    origine: Optional[str] = None
    ethnie: Optional[str] = None

# Router
router = APIRouter(prefix="/api/neo4j", tags=["Neo4j"])

# Service Neo4j
def get_neo4j_service():
    """Dépendance pour obtenir le service Neo4j."""
    service = Neo4jService()
    service.connect()
    try:
        yield service
    finally:
        service.close()

# Routes pour les ethnies
@router.get("/ethnies", response_model=List[Dict[str, Any]])
async def get_ethnies(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère toutes les ethnies."""
    try:
        return service.get_ethnies()
    except Exception as e:
        logger.error(f"Erreur récupération ethnies: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.get("/ethnies/{nom}", response_model=Dict[str, Any])
async def get_ethnie(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère une ethnie par son nom."""
    try:
        ethnie = service.get_ethnie_by_name(nom)
        if not ethnie:
            raise HTTPException(status_code=404, detail="Ethnie non trouvée")
        return ethnie
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur récupération ethnie {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.post("/ethnies", response_model=Dict[str, str])
async def create_ethnie(ethnie: EthnieCreate, service: Neo4jService = Depends(get_neo4j_service)):
    """Crée une nouvelle ethnie."""
    try:
        success = service.add_ethnie(ethnie.dict())
        if success:
            return {"message": f"Ethnie {ethnie.nom} créée avec succès"}
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de la création")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur création ethnie: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.put("/ethnies/{nom}", response_model=Dict[str, str])
async def update_ethnie(nom: str, ethnie: EthnieUpdate, service: Neo4jService = Depends(get_neo4j_service)):
    """Met à jour une ethnie existante."""
    try:
        success = service.update_ethnie(nom, ethnie.dict(exclude_unset=True))
        if success:
            return {"message": f"Ethnie {nom} mise à jour avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Ethnie non trouvée")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise à jour ethnie {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.delete("/ethnies/{nom}", response_model=Dict[str, str])
async def delete_ethnie(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Supprime une ethnie."""
    try:
        success = service.delete_ethnie(nom)
        if success:
            return {"message": f"Ethnie {nom} supprimée avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Ethnie non trouvée")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression ethnie {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes pour les langues
@router.get("/langues", response_model=List[Dict[str, Any]])
async def get_langues(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère toutes les langues."""
    try:
        return service.get_langues()
    except Exception as e:
        logger.error(f"Erreur récupération langues: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.get("/langues/{nom}", response_model=Dict[str, Any])
async def get_langue(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère une langue par son nom."""
    try:
        langue = service.get_langue_by_name(nom)
        if not langue:
            raise HTTPException(status_code=404, detail="Langue non trouvée")
        return langue
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur récupération langue {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes CRUD pour les langues
@router.post("/langues", response_model=Dict[str, str])
async def create_langue(langue: LangueCreate, service: Neo4jService = Depends(get_neo4j_service)):
    """Crée une nouvelle langue."""
    try:
        success = service.add_langue(langue.dict())
        if success:
            return {"message": f"Langue {langue.nom} créée avec succès"}
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de la création")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur création langue {langue.nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.put("/langues/{nom}", response_model=Dict[str, str])
async def update_langue(nom: str, langue: LangueUpdate, service: Neo4jService = Depends(get_neo4j_service)):
    """Met à jour une langue existante."""
    try:
        success = service.update_langue(nom, langue.dict(exclude_unset=True))
        if success:
            return {"message": f"Langue {nom} mise à jour avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Langue non trouvée")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise à jour langue {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.delete("/langues/{nom}", response_model=Dict[str, str])
async def delete_langue(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Supprime une langue."""
    try:
        success = service.delete_langue(nom)
        if success:
            return {"message": f"Langue {nom} supprimée avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Langue non trouvée")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression langue {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes pour les localités
@router.get("/localites", response_model=List[Dict[str, Any]])
async def get_localites(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère toutes les localités."""
    try:
        return service.get_localites()
    except Exception as e:
        logger.error(f"Erreur récupération localités: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.get("/localites/{nom}", response_model=Dict[str, Any])
async def get_localite(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère une localité par son nom."""
    try:
        localite = service.get_localite_by_name(nom)
        if not localite:
            raise HTTPException(status_code=404, detail="Localité non trouvée")
        return localite
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur récupération localité {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes CRUD pour les dialectes
@router.post("/dialectes", response_model=Dict[str, str])
async def create_dialecte(dialecte: DialecteCreate, service: Neo4jService = Depends(get_neo4j_service)):
    """Crée un nouveau dialecte."""
    try:
        success = service.add_dialecte(dialecte.dict())
        if success:
            return {"message": f"Dialecte {dialecte.nom} créé avec succès"}
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de la création")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur création dialecte {dialecte.nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.put("/dialectes/{nom}", response_model=Dict[str, str])
async def update_dialecte(nom: str, dialecte: DialecteUpdate, service: Neo4jService = Depends(get_neo4j_service)):
    """Met à jour un dialecte existant."""
    try:
        success = service.update_dialecte(nom, dialecte.dict(exclude_unset=True))
        if success:
            return {"message": f"Dialecte {nom} mis à jour avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Dialecte non trouvé")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise à jour dialecte {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.delete("/dialectes/{nom}", response_model=Dict[str, str])
async def delete_dialecte(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Supprime un dialecte."""
    try:
        success = service.delete_dialecte(nom)
        if success:
            return {"message": f"Dialecte {nom} supprimé avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Dialecte non trouvé")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression dialecte {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes pour les dialectes
@router.get("/dialectes", response_model=List[Dict[str, Any]])
async def get_dialectes(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère tous les dialectes."""
    try:
        return service.get_dialectes()
    except Exception as e:
        logger.error(f"Erreur récupération dialectes: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.get("/dialectes/{nom}", response_model=Dict[str, Any])
async def get_dialecte(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère un dialecte par son nom."""
    try:
        dialecte = service.get_dialecte_by_name(nom)
        if not dialecte:
            raise HTTPException(status_code=404, detail="Dialecte non trouvé")
        return dialecte
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur récupération dialecte {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes pour les patronymes
@router.get("/patronymes", response_model=List[Dict[str, Any]])
async def get_patronymes(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère tous les patronymes."""
    try:
        return service.get_patronymes()
    except Exception as e:
        logger.error(f"Erreur récupération patronymes: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.get("/patronymes/{nom}", response_model=Dict[str, Any])
async def get_patronyme(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère un patronyme par son nom."""
    try:
        patronyme = service.get_patronyme_by_name(nom)
        if not patronyme:
            raise HTTPException(status_code=404, detail="Patronyme non trouvé")
        return patronyme
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur récupération patronyme {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes CRUD pour les patronymes
@router.post("/patronymes", response_model=Dict[str, str])
async def create_patronyme(patronyme: PatronymeCreate, service: Neo4jService = Depends(get_neo4j_service)):
    """Crée un nouveau patronyme."""
    try:
        success = service.add_patronyme(patronyme.dict())
        if success:
            return {"message": f"Patronyme {patronyme.nom} créé avec succès"}
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de la création")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur création patronyme {patronyme.nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.put("/patronymes/{nom}", response_model=Dict[str, str])
async def update_patronyme(nom: str, patronyme: PatronymeUpdate, service: Neo4jService = Depends(get_neo4j_service)):
    """Met à jour un patronyme existant."""
    try:
        success = service.update_patronyme(nom, patronyme.dict(exclude_unset=True))
        if success:
            return {"message": f"Patronyme {nom} mis à jour avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Patronyme non trouvé")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise à jour patronyme {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.delete("/patronymes/{nom}", response_model=Dict[str, str])
async def delete_patronyme(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Supprime un patronyme."""
    try:
        success = service.delete_patronyme(nom)
        if success:
            return {"message": f"Patronyme {nom} supprimé avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Patronyme non trouvé")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression patronyme {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes pour les familles linguistiques
@router.get("/familles-linguistiques", response_model=List[Dict[str, Any]])
async def get_familles_linguistiques(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère toutes les familles linguistiques."""
    try:
        return service.get_familles_linguistiques()
    except Exception as e:
        logger.error(f"Erreur récupération familles linguistiques: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes CRUD pour les familles linguistiques
@router.post("/familles-linguistiques", response_model=Dict[str, str])
async def create_famille_linguistique(famille: FamilleLinguistiqueCreate, service: Neo4jService = Depends(get_neo4j_service)):
    """Crée une nouvelle famille linguistique."""
    try:
        success = service.add_famille_linguistique(famille.dict())
        if success:
            return {"message": f"Famille linguistique {famille.nom} créée avec succès"}
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de la création")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur création famille linguistique {famille.nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.put("/familles-linguistiques/{nom}", response_model=Dict[str, str])
async def update_famille_linguistique(nom: str, famille: FamilleLinguistiqueUpdate, service: Neo4jService = Depends(get_neo4j_service)):
    """Met à jour une famille linguistique existante."""
    try:
        success = service.update_famille_linguistique(nom, famille.dict(exclude_unset=True))
        if success:
            return {"message": f"Famille linguistique {nom} mise à jour avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Famille linguistique non trouvée")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise à jour famille linguistique {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.delete("/familles-linguistiques/{nom}", response_model=Dict[str, str])
async def delete_famille_linguistique(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Supprime une famille linguistique."""
    try:
        success = service.delete_famille_linguistique(nom)
        if success:
            return {"message": f"Famille linguistique {nom} supprimée avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Famille linguistique non trouvée")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression famille linguistique {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes pour les régions
@router.get("/regions", response_model=List[Dict[str, Any]])
async def get_regions(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère toutes les régions."""
    try:
        return service.get_regions()
    except Exception as e:
        logger.error(f"Erreur récupération régions: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.get("/regions/{nom}", response_model=Dict[str, Any])
async def get_region(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère une région par son nom."""
    try:
        region = service.get_region_by_name(nom)
        if not region:
            raise HTTPException(status_code=404, detail="Région non trouvée")
        return region
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur récupération région {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Routes CRUD pour les régions
@router.post("/regions", response_model=Dict[str, str])
async def create_region(region: RegionCreate, service: Neo4jService = Depends(get_neo4j_service)):
    """Crée une nouvelle région."""
    try:
        success = service.add_region(region.dict())
        if success:
            return {"message": f"Région {region.nom} créée avec succès"}
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de la création")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur création région {region.nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.put("/regions/{nom}", response_model=Dict[str, str])
async def update_region(nom: str, region: RegionUpdate, service: Neo4jService = Depends(get_neo4j_service)):
    """Met à jour une région existante."""
    try:
        success = service.update_region(nom, region.dict(exclude_unset=True))
        if success:
            return {"message": f"Région {nom} mise à jour avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Région non trouvée")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise à jour région {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.delete("/regions/{nom}", response_model=Dict[str, str])
async def delete_region(nom: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Supprime une région."""
    try:
        success = service.delete_region(nom)
        if success:
            return {"message": f"Région {nom} supprimée avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Région non trouvée")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression région {nom}: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Route de recherche
@router.get("/search", response_model=Dict[str, List[Dict[str, Any]]])
async def search_entities(q: str, service: Neo4jService = Depends(get_neo4j_service)):
    """Recherche d'entités par terme."""
    try:
        if not q or len(q.strip()) < 2:
            raise HTTPException(status_code=400, detail="Terme de recherche trop court")
        
        return service.search_entities(q.strip())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur recherche '{q}': {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Route des statistiques
@router.get("/statistics", response_model=Dict[str, Any])
async def get_statistics(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère les statistiques générales."""
    try:
        return service.get_statistics()
    except Exception as e:
        logger.error(f"Erreur récupération statistiques: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Route des ethnies par région
@router.get("/ethnies-par-region", response_model=List[Dict[str, Any]])
async def get_ethnies_par_region(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère les ethnies groupées par région."""
    try:
        return service.get_ethnies_par_region()
    except Exception as e:
        logger.error(f"Erreur récupération ethnies par région: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Route du graphe des relations
@router.get("/graph", response_model=Dict[str, Any])
async def get_relationships_graph(service: Neo4jService = Depends(get_neo4j_service)):
    """Récupère le graphe des relations pour visualisation."""
    try:
        return service.get_relationships_graph()
    except Exception as e:
        logger.error(f"Erreur récupération graphe: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Route de test de connexion
@router.get("/health", response_model=Dict[str, str])
async def health_check(service: Neo4jService = Depends(get_neo4j_service)):
    """Test de connexion à Neo4j."""
    try:
        # Test simple de connexion
        stats = service.get_statistics()
        return {
            "status": "healthy",
            "message": "Connexion Neo4j OK",
            "entities_count": sum(stats.values())
        }
    except Exception as e:
        logger.error(f"Erreur health check: {e}")
        raise HTTPException(status_code=503, detail="Service Neo4j indisponible") 