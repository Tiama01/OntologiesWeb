#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AJOUT DE RÉGIONS DE TEST VIA L'API
Script pour peupler la base avec des régions du Burkina Faso
"""

import requests
import json
import time

# Configuration
API_BASE_URL = "http://localhost:8000/api/neo4j"

# Régions du Burkina Faso avec leurs coordonnées GPS
REGIONS_TEST = [
    {
        "nom": "Centre",
        "description": "Région administrative du centre du Burkina Faso",
        "latitude": 12.3714,
        "longitude": -1.5197,
        "ethnies_majoritaires": "Mossi, Gourounsi"
    },
    {
        "nom": "Hauts-Bassins",
        "description": "Région des Hauts-Bassins, capitale Bobo-Dioulasso",
        "latitude": 11.1783,
        "longitude": -4.2894,
        "ethnies_majoritaires": "Bobo, Dioula, Sénoufo"
    },
    {
        "nom": "Sahel",
        "description": "Région sahélienne au nord du pays",
        "latitude": 14.0356,
        "longitude": -0.0236,
        "ethnies_majoritaires": "Peul, Touareg, Songhaï"
    },
    {
        "nom": "Est",
        "description": "Région de l'est, capitale Fada N'Gourma",
        "latitude": 12.0564,
        "longitude": 0.3582,
        "ethnies_majoritaires": "Gourmantché, Bissa"
    },
    {
        "nom": "Nord",
        "description": "Région du nord, capitale Ouahigouya",
        "latitude": 13.5833,
        "longitude": -2.4167,
        "ethnies_majoritaires": "Mossi, Peul"
    },
    {
        "nom": "Centre-Nord",
        "description": "Région du centre-nord, capitale Kaya",
        "latitude": 13.0917,
        "longitude": -1.0847,
        "ethnies_majoritaires": "Mossi, Peul"
    },
    {
        "nom": "Centre-Ouest",
        "description": "Région du centre-ouest, capitale Koudougou",
        "latitude": 12.2526,
        "longitude": -2.3618,
        "ethnies_majoritaires": "Mossi, Gourounsi"
    },
    {
        "nom": "Centre-Sud",
        "description": "Région du centre-sud, capitale Manga",
        "latitude": 11.6667,
        "longitude": -1.0667,
        "ethnies_majoritaires": "Mossi, Gourounsi"
    },
    {
        "nom": "Sud-Ouest",
        "description": "Région du sud-ouest, capitale Gaoua",
        "latitude": 10.2991,
        "longitude": -3.2507,
        "ethnies_majoritaires": "Lobi, Dagara, Birifor"
    },
    {
        "nom": "Boucle du Mouhoun",
        "description": "Région de la boucle du Mouhoun, capitale Dédougou",
        "latitude": 12.4634,
        "longitude": -3.4608,
        "ethnies_majoritaires": "Bobo, Marka, Samo"
    },
    {
        "nom": "Cascades",
        "description": "Région des Cascades, capitale Banfora",
        "latitude": 10.6333,
        "longitude": -4.7667,
        "ethnies_majoritaires": "Sénoufo, Karaboro"
    },
    {
        "nom": "Plateau-Central",
        "description": "Région du plateau central, capitale Ziniaré",
        "latitude": 12.5833,
        "longitude": -1.3000,
        "ethnies_majoritaires": "Mossi, Gourounsi"
    }
]

def add_regions():
    """Ajoute les régions de test via l'API."""
    print("🚀 Ajout des régions de test via l'API...")
    
    # Vérifier que l'API est accessible
    try:
        response = requests.get(f"{API_BASE_URL}/regions")
        if response.status_code != 200:
            print(f"❌ Erreur API: {response.status_code}")
            return
        print("✅ API accessible")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur connexion API: {e}")
        return
    
    # Ajouter chaque région
    for i, region in enumerate(REGIONS_TEST, 1):
        try:
            print(f"📝 Ajout région {i}/{len(REGIONS_TEST)}: {region['nom']}")
            
            response = requests.post(
                f"{API_BASE_URL}/regions",
                json=region,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"✅ Région ajoutée: {region['nom']}")
            else:
                print(f"⚠️ Erreur ajout {region['nom']}: {response.status_code}")
                if response.text:
                    print(f"   Détail: {response.text}")
            
            # Pause entre les requêtes
            time.sleep(0.5)
            
        except Exception as e:
            print(f"❌ Erreur lors de l'ajout de {region['nom']}: {e}")
    
    print("\n🎉 Ajout des régions terminé !")
    
    # Vérifier le nombre final
    try:
        response = requests.get(f"{API_BASE_URL}/regions")
        if response.status_code == 200:
            regions = response.json()
            print(f"📊 Total des régions: {len(regions)}")
        else:
            print("❌ Impossible de vérifier le total")
    except Exception as e:
        print(f"❌ Erreur vérification: {e}")

if __name__ == "__main__":
    add_regions() 