#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
APPLICATION D'EXPLOITATION - ONTOLOGIE BURKINA FASO ENRICHIE
Version complète avec 60+ ethnies, langues, dialectes et patronymes
Auteur: Tiama Bernard
Date: Juin 2025
"""

import sys
import json
import csv
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import argparse
from datetime import datetime

try:
    from rdflib import Graph, Namespace, URIRef, Literal
    from rdflib.plugins.sparql import prepareQuery
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns
    from tabulate import tabulate
    from rich.console import Console
    from rich.table import Table
    from rich.progress import track
    from rich.panel import Panel
    from rich.text import Text
except ImportError as e:
    print(f"Erreur d'importation: {e}")
    print("Installez les dépendances avec: pip install -r requirements.txt")
    sys.exit(1)

# Configuration
ONTOLOGY_FILE = "ontologie_burkina_faso.owl"
NAMESPACE = "http://www.semanticweb.org/ontologie_burkina_faso#"

class OntologieBurkinaFaso:
    """Application principale d'exploitation de l'ontologie du Burkina Faso."""
    
    def __init__(self, ontology_path: str = ONTOLOGY_FILE):
        self.console = Console()
        self.graph = Graph()
        self.ns = Namespace(NAMESPACE)
        self.ontology_path = ontology_path
        self.stats_cache = {}
        
        # Chargement de l'ontologie
        self._load_ontology()
        
    def _load_ontology(self):
        """Charge l'ontologie OWL dans le graphe RDF."""
        try:
            self.graph.parse(self.ontology_path)
            self.console.print(f"✅ Ontologie chargée: {len(self.graph)} triples", style="green")
        except Exception as e:
            self.console.print(f"❌ Erreur de chargement: {e}", style="red")
            sys.exit(1)
    
    def execute_sparql(self, query: str) -> List[Dict]:
        """Exécute une requête SPARQL et retourne les résultats."""
        try:
            prefixes = f"""
            PREFIX : <{NAMESPACE}>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            """
            full_query = prefixes + query
            results = self.graph.query(full_query)
            return [dict(row.asdict()) for row in results]
        except Exception as e:
            self.console.print(f"❌ Erreur SPARQL: {e}", style="red")
            return []
    
    def get_ethnies_stats(self) -> Dict:
        """Statistiques complètes sur les ethnies."""
        if 'ethnies' in self.stats_cache:
            return self.stats_cache['ethnies']
            
        query = """
        SELECT ?nom ?population ?pourcentage ?statut ?region
        WHERE {
            ?ethnie a :Ethnie ;
                   :nom ?nom ;
                   :populationEstimee ?population ;
                   :pourcentageNational ?pourcentage ;
                   :statutNational ?statut .
            OPTIONAL { ?ethnie :estLocalise ?loc . ?loc :nom ?region }
        }
        ORDER BY DESC(?population)
        """
        
        results = self.execute_sparql(query)
        stats = {
            'total': len(results),
            'population_totale': sum(int(r.get('population', 0)) for r in results),
            'majoritaires': [r for r in results if str(r.get('statut', '')).endswith('MAJORITAIRE')],
            'minoritaires': [r for r in results if str(r.get('statut', '')).endswith('MINORITAIRE')],
            'par_region': {},
            'data': results
        }
        
        # Grouper par région
        for result in results:
            region = str(result.get('region', 'Non spécifiée'))
            if region not in stats['par_region']:
                stats['par_region'][region] = []
            stats['par_region'][region].append(result)
        
        self.stats_cache['ethnies'] = stats
        return stats
    
    def get_langues_stats(self) -> Dict:
        """Statistiques complètes sur les langues."""
        if 'langues' in self.stats_cache:
            return self.stats_cache['langues']
            
        query = """
        SELECT ?nom ?locuteurs ?famille
        WHERE {
            ?langue a :Langue ;
                   :nom ?nom ;
                   :nombreLocuteur ?locuteurs ;
                   :aPourFamilleLinguistique ?fam .
            ?fam :nom ?famille
        }
        ORDER BY DESC(?locuteurs)
        """
        
        results = self.execute_sparql(query)
        stats = {
            'total': len(results),
            'locuteurs_totaux': sum(int(r.get('locuteurs', 0)) for r in results),
            'par_famille': {},
            'vehiculaires': [r for r in results if int(r.get('locuteurs', 0)) > 100000],
            'en_danger': [r for r in results if int(r.get('locuteurs', 0)) < 5000],
            'data': results
        }
        
        # Grouper par famille linguistique
        for result in results:
            famille = str(result.get('famille', 'Inconnue'))
            if famille not in stats['par_famille']:
                stats['par_famille'][famille] = []
            stats['par_famille'][famille].append(result)
        
        self.stats_cache['langues'] = stats
        return stats
    
    def get_dialectes_stats(self) -> Dict:
        """Statistiques sur les dialectes."""
        query = """
        SELECT ?dialecte_nom ?langue_nom ?region ?description
        WHERE {
            ?dialecte a :Dialecte ;
                     :nom ?dialecte_nom ;
                     :description ?description ;
                     :aPourLangue ?langue ;
                     :aPourLocalisation ?loc .
            ?langue :nom ?langue_nom .
            ?loc :nom ?region
        }
        ORDER BY ?langue_nom ?dialecte_nom
        """
        
        results = self.execute_sparql(query)
        stats = {
            'total': len(results),
            'par_langue': {},
            'par_region': {},
            'data': results
        }
        
        for result in results:
            langue = str(result.get('langue_nom', 'Inconnue'))
            region = str(result.get('region', 'Inconnue'))
            
            if langue not in stats['par_langue']:
                stats['par_langue'][langue] = []
            stats['par_langue'][langue].append(result)
            
            if region not in stats['par_region']:
                stats['par_region'][region] = []
            stats['par_region'][region].append(result)
        
        return stats
    
    def get_patronymes_stats(self) -> Dict:
        """Statistiques sur les patronymes."""
        query = """
        SELECT ?patronyme_nom ?signification ?origine ?ethnie_nom
        WHERE {
            ?patronyme a :Patronyme ;
                      :nom ?patronyme_nom ;
                      :signification ?signification ;
                      :origine ?origine ;
                      :aPourEthnie ?ethnie .
            ?ethnie :nom ?ethnie_nom
        }
        ORDER BY ?ethnie_nom ?patronyme_nom
        """
        
        results = self.execute_sparql(query)
        stats = {
            'total': len(results),
            'par_ethnie': {},
            'themes': {},
            'data': results
        }
        
        # Analyser les thèmes des patronymes
        themes_keywords = {
            'Religieux': ['dieu', 'allah', 'saint', 'béni', 'protège'],
            'Royal/Noble': ['roi', 'chef', 'noble', 'royal', 'prince'],
            'Guerrier': ['guerre', 'brave', 'courageux', 'guerrier', 'fort'],
            'Paix': ['paix', 'bon', 'sage', 'bienveillant', 'généreux'],
            'Nature': ['eau', 'terre', 'arbre', 'mil', 'animal'],
            'Familial': ['maison', 'famille', 'frère', 'enfant', 'descendant']
        }
        
        for result in results:
            ethnie = str(result.get('ethnie_nom', 'Inconnue'))
            signification = str(result.get('signification', '')).lower()
            
            # Grouper par ethnie
            if ethnie not in stats['par_ethnie']:
                stats['par_ethnie'][ethnie] = []
            stats['par_ethnie'][ethnie].append(result)
            
            # Analyser les thèmes
            for theme, keywords in themes_keywords.items():
                if any(keyword in signification for keyword in keywords):
                    if theme not in stats['themes']:
                        stats['themes'][theme] = []
                    stats['themes'][theme].append(result)
                    break
        
        return stats
    
    def rechercher_patronyme(self, terme: str) -> List[Dict]:
        """Recherche un patronyme par nom, signification ou ethnie."""
        query = f"""
        SELECT ?patronyme_nom ?signification ?ethnie_nom ?origine
        WHERE {{
            ?patronyme a :Patronyme ;
                      :nom ?patronyme_nom ;
                      :signification ?signification ;
                      :origine ?origine ;
                      :aPourEthnie ?ethnie .
            ?ethnie :nom ?ethnie_nom .
            
            FILTER(
                CONTAINS(LCASE(?patronyme_nom), LCASE("{terme}")) ||
                CONTAINS(LCASE(?signification), LCASE("{terme}")) ||
                CONTAINS(LCASE(?ethnie_nom), LCASE("{terme}"))
            )
        }}
        ORDER BY ?ethnie_nom ?patronyme_nom
        """
        
        return self.execute_sparql(query)
    
    def get_synthese_complete(self) -> Dict:
        """Synthèse démographique complète."""
        query = """
        SELECT 
            (COUNT(DISTINCT ?ethnie) AS ?total_ethnies)
            (COUNT(DISTINCT ?langue) AS ?total_langues) 
            (COUNT(DISTINCT ?dialecte) AS ?total_dialectes)
            (COUNT(DISTINCT ?patronyme) AS ?total_patronymes)
            (COUNT(DISTINCT ?region) AS ?total_regions)
            (SUM(?population) AS ?population_totale)
        WHERE {
            ?ethnie a :Ethnie ;
                   :populationEstimee ?population .
            OPTIONAL { ?ethnie :parle ?langue }
            OPTIONAL { ?langue :aPourDialecte ?dialecte }
            OPTIONAL { ?patronyme :aPourEthnie ?ethnie }
            OPTIONAL { ?ethnie :estLocalise ?region }
        }
        """
        
        results = self.execute_sparql(query)
        return results[0] if results else {}
    
    def afficher_menu_principal(self):
        """Affiche le menu principal de l'application."""
        self.console.clear()
        
        # En-tête avec synthèse
        synthese = self.get_synthese_complete()
        
        title = Text("🇧🇫 ONTOLOGIE DU BURKINA FASO - VERSION ENRICHIE", style="bold blue")
        self.console.print(Panel(title, expand=False))
        
        if synthese:
            stats_text = f"""
📊 Synthèse des données :
   • {synthese.get('total_ethnies', '60+')} Ethnies documentées
   • {synthese.get('total_langues', '60+')} Langues répertoriées  
   • {synthese.get('total_dialectes', '30+')} Dialectes régionaux
   • {synthese.get('total_patronymes', '60+')} Patronymes avec significations
   • {synthese.get('total_regions', '13')} Régions géographiques
   • {int(synthese.get('population_totale', 23000000)):,} Habitants total
            """
            self.console.print(Panel(stats_text.strip(), title="📈 Statistiques", style="green"))
        
        # Menu des options
        menu = """
🏘️  [1] Analyser les ethnies
🗣️  [2] Explorer les langues
🌍 [3] Dialectes régionaux  
👨‍👩‍👧‍👦 [4] Rechercher patronymes
🗺️  [5] Géographie et régions
📊 [6] Visualisations
💾 [7] Exporter données
🔍 [8] Requête SPARQL personnalisée
❓ [9] Aide et documentation
🚪 [0] Quitter
        """
        
        self.console.print(Panel(menu.strip(), title="🎯 Menu Principal", style="cyan"))
    
    def analyser_ethnies(self):
        """Analyse détaillée des ethnies."""
        self.console.print("\n🏘️ [bold blue]ANALYSE DES ETHNIES[/bold blue]\n")
        
        stats = self.get_ethnies_stats()
        
        # Tableau des ethnies principales
        table = Table(title="📋 Top 15 des Ethnies par Population")
        table.add_column("Ethnie", style="cyan", no_wrap=True)
        table.add_column("Population", style="magenta", justify="right")
        table.add_column("Pourcentage", style="green", justify="right")
        table.add_column("Statut", style="yellow")
        table.add_column("Région", style="blue")
        
        for ethnie in stats['data'][:15]:
            population = f"{int(ethnie.get('population', 0)):,}"
            pourcentage = f"{float(ethnie.get('pourcentage', 0)):.1f}%"
            statut = str(ethnie.get('statut', '')).split('#')[-1]
            region = str(ethnie.get('region', 'Multiple'))[:15]
            
            table.add_row(
                str(ethnie.get('nom', '')),
                population,
                pourcentage,
                statut,
                region
            )
        
        self.console.print(table)
        
        # Statistiques résumées
        stats_text = f"""
📊 Résumé :
   • Total ethnies : {stats['total']}
   • Population totale : {stats['population_totale']:,} habitants
   • Ethnies majoritaires : {len(stats['majoritaires'])}
   • Ethnies minoritaires : {len(stats['minoritaires'])}
   • Régions couvertes : {len(stats['par_region'])}
        """
        self.console.print(Panel(stats_text.strip(), title="📈 Synthèse Ethnies", style="green"))
    
    def explorer_langues(self):
        """Exploration détaillée des langues."""
        self.console.print("\n🗣️ [bold blue]EXPLORATION DES LANGUES[/bold blue]\n")
        
        stats = self.get_langues_stats()
        
        # Tableau des langues principales
        table = Table(title="🗣️ Top 15 des Langues par Nombre de Locuteurs")
        table.add_column("Langue", style="cyan", no_wrap=True)
        table.add_column("Locuteurs", style="magenta", justify="right")
        table.add_column("Famille Linguistique", style="green")
        table.add_column("Statut", style="yellow")
        
        for langue in stats['data'][:15]:
            locuteurs = int(langue.get('locuteurs', 0))
            
            # Déterminer le statut
            if locuteurs > 1000000:
                statut = "🔥 Dominante"
            elif locuteurs > 100000:
                statut = "📢 Véhiculaire"
            elif locuteurs > 10000:
                statut = "🏘️ Régionale"
            else:
                statut = "⚠️ En danger"
            
            table.add_row(
                str(langue.get('nom', '')),
                f"{locuteurs:,}",
                str(langue.get('famille', ''))[:20],
                statut
            )
        
        self.console.print(table)
        
        # Analyse par famille linguistique
        self.console.print("\n📊 [bold]Répartition par famille linguistique :[/bold]\n")
        
        for famille, langues in stats['par_famille'].items():
            total_locuteurs = sum(int(l.get('locuteurs', 0)) for l in langues)
            self.console.print(f"• {famille} : {len(langues)} langues, {total_locuteurs:,} locuteurs")
    
    def dialectes_regionaux(self):
        """Analyse des dialectes régionaux."""
        self.console.print("\n🌍 [bold blue]DIALECTES RÉGIONAUX[/bold blue]\n")
        
        stats = self.get_dialectes_stats()
        
        # Tableau des dialectes
        table = Table(title="🗣️ Dialectes par Langue et Région")
        table.add_column("Dialecte", style="cyan")
        table.add_column("Langue Mère", style="magenta")
        table.add_column("Région", style="green")
        table.add_column("Description", style="yellow")
        
        for dialecte in stats['data'][:20]:  # Limiter l'affichage
            table.add_row(
                str(dialecte.get('dialecte_nom', '')),
                str(dialecte.get('langue_nom', '')),
                str(dialecte.get('region', '')),
                str(dialecte.get('description', ''))[:40] + "..."
            )
        
        self.console.print(table)
        
        # Statistiques
        stats_text = f"""
📊 Résumé Dialectes :
   • Total dialectes : {stats['total']}
   • Langues avec dialectes : {len(stats['par_langue'])}
   • Régions concernées : {len(stats['par_region'])}
        """
        self.console.print(Panel(stats_text.strip(), title="📈 Synthèse Dialectes", style="blue"))
    
    def rechercher_patronymes_interactif(self):
        """Interface de recherche interactive pour les patronymes."""
        self.console.print("\n👨‍👩‍👧‍👦 [bold blue]RECHERCHE DE PATRONYMES[/bold blue]\n")
        
        # Statistiques générales
        stats = self.get_patronymes_stats()
        
        self.console.print(f"📊 {stats['total']} patronymes dans la base de données")
        self.console.print(f"🏘️ {len(stats['par_ethnie'])} ethnies représentées")
        
        # Recherche interactive
        while True:
            terme = input("\n🔍 Entrez un nom, signification ou ethnie (ou 'q' pour quitter): ").strip()
            
            if terme.lower() == 'q':
                break
                
            if not terme:
                continue
            
            resultats = self.rechercher_patronyme(terme)
            
            if not resultats:
                self.console.print(f"❌ Aucun résultat pour '{terme}'")
                continue
            
            # Afficher les résultats
            table = Table(title=f"🔍 Résultats pour '{terme}' ({len(resultats)} trouvé(s))")
            table.add_column("Patronyme", style="cyan", no_wrap=True)
            table.add_column("Signification", style="yellow")
            table.add_column("Ethnie", style="green")
            table.add_column("Origine", style="blue")
            
            for result in resultats[:10]:  # Limiter à 10 résultats
                table.add_row(
                    str(result.get('patronyme_nom', '')),
                    str(result.get('signification', ''))[:30] + "...",
                    str(result.get('ethnie_nom', '')),
                    str(result.get('origine', ''))[:25] + "..."
                )
            
            self.console.print(table)
    
    def export_donnees(self):
        """Export des données en différents formats."""
        self.console.print("\n💾 [bold blue]EXPORT DES DONNÉES[/bold blue]\n")
        
        formats = {
            '1': ('CSV', self._export_csv),
            '2': ('JSON', self._export_json),
            '3': ('Excel', self._export_excel),
            '4': ('Rapport HTML', self._export_html)
        }
        
        self.console.print("Formats disponibles :")
        for key, (name, _) in formats.items():
            self.console.print(f"  {key}. {name}")
        
        choix = input("\nChoisissez un format (1-4): ").strip()
        
        if choix in formats:
            name, func = formats[choix]
            self.console.print(f"\n📤 Export en cours vers {name}...")
            try:
                filename = func()
                self.console.print(f"✅ Export réussi : {filename}", style="green")
            except Exception as e:
                self.console.print(f"❌ Erreur d'export : {e}", style="red")
        else:
            self.console.print("❌ Choix invalide")
    
    def _export_csv(self) -> str:
        """Export CSV des données principales."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Export ethnies
        ethnies_stats = self.get_ethnies_stats()
        filename = f"ethnies_burkina_{timestamp}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['nom', 'population', 'pourcentage', 'statut', 'region'])
            writer.writeheader()
            for ethnie in ethnies_stats['data']:
                writer.writerow({
                    'nom': ethnie.get('nom', ''),
                    'population': ethnie.get('population', 0),
                    'pourcentage': ethnie.get('pourcentage', 0),
                    'statut': str(ethnie.get('statut', '')).split('#')[-1],
                    'region': ethnie.get('region', '')
                })
        
        return filename
    
    def _export_json(self) -> str:
        """Export JSON complet."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ontologie_burkina_{timestamp}.json"
        
        data = {
            'metadata': {
                'export_date': datetime.now().isoformat(),
                'version': '2.0',
                'description': 'Ontologie complète du Burkina Faso'
            },
            'synthese': self.get_synthese_complete(),
            'ethnies': self.get_ethnies_stats(),
            'langues': self.get_langues_stats(),
            'dialectes': self.get_dialectes_stats(),
            'patronymes': self.get_patronymes_stats()
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        
        return filename
    
    def _export_excel(self) -> str:
        """Export Excel avec feuilles multiples."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ontologie_burkina_{timestamp}.xlsx"
        
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # Ethnies
            ethnies_data = []
            for ethnie in self.get_ethnies_stats()['data']:
                ethnies_data.append({
                    'Nom': ethnie.get('nom', ''),
                    'Population': int(ethnie.get('population', 0)),
                    'Pourcentage': float(ethnie.get('pourcentage', 0)),
                    'Statut': str(ethnie.get('statut', '')).split('#')[-1],
                    'Région': ethnie.get('region', '')
                })
            
            pd.DataFrame(ethnies_data).to_excel(writer, sheet_name='Ethnies', index=False)
            
            # Langues
            langues_data = []
            for langue in self.get_langues_stats()['data']:
                langues_data.append({
                    'Langue': langue.get('nom', ''),
                    'Locuteurs': int(langue.get('locuteurs', 0)),
                    'Famille': langue.get('famille', '')
                })
            
            pd.DataFrame(langues_data).to_excel(writer, sheet_name='Langues', index=False)
        
        return filename
    
    def _export_html(self) -> str:
        """Génère un rapport HTML complet."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"rapport_burkina_{timestamp}.html"
        
        html_content = f"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Rapport Ontologie Burkina Faso</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .header {{ background: linear-gradient(135deg, #ff6b6b, #4ecdc4); 
                          color: white; padding: 20px; border-radius: 10px; }}
                .stats {{ background: #f8f9fa; padding: 15px; margin: 20px 0; 
                         border-left: 4px solid #007bff; }}
                table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .footer {{ text-align: center; margin-top: 40px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🇧🇫 Rapport Ontologie Burkina Faso</h1>
                <p>Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
            </div>
            
            <div class="stats">
                <h2>📊 Synthèse Générale</h2>
                <p>Cette ontologie documente la diversité ethnolinguistique du Burkina Faso avec :</p>
                <ul>
                    <li><strong>60+ ethnies</strong> avec données démographiques</li>
                    <li><strong>60+ langues</strong> avec nombre de locuteurs</li>
                    <li><strong>30+ dialectes</strong> régionaux documentés</li>
                    <li><strong>60+ patronymes</strong> avec significations culturelles</li>
                    <li><strong>13 régions</strong> géographiques complètes</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Rapport généré par l'Application Ontologie Burkina Faso v2.0</p>
            </div>
        </body>
        </html>
        """
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return filename
    
    def run(self):
        """Boucle principale de l'application."""
        while True:
            try:
                self.afficher_menu_principal()
                
                choix = input("\n🎯 Votre choix (0-9): ").strip()
                
                if choix == '0':
                    self.console.print("\n👋 Au revoir !", style="bold blue")
                    break
                elif choix == '1':
                    self.analyser_ethnies()
                elif choix == '2':
                    self.explorer_langues()
                elif choix == '3':
                    self.dialectes_regionaux()
                elif choix == '4':
                    self.rechercher_patronymes_interactif()
                elif choix == '7':
                    self.export_donnees()
                else:
                    self.console.print("🚧 Fonctionnalité en développement", style="yellow")
                
                input("\n⏸️  Appuyez sur Entrée pour continuer...")
                
            except KeyboardInterrupt:
                self.console.print("\n\n👋 Programme interrompu. Au revoir !", style="bold red")
                break
            except Exception as e:
                self.console.print(f"\n❌ Erreur inattendue : {e}", style="red")
                input("⏸️  Appuyez sur Entrée pour continuer...")

def main():
    """Point d'entrée principal."""
    parser = argparse.ArgumentParser(description="Application Ontologie Burkina Faso")
    parser.add_argument("--ontology", default=ONTOLOGY_FILE, help="Chemin vers le fichier OWL")
    parser.add_argument("--version", action="version", version="2.0")
    
    args = parser.parse_args()
    
    # Vérifier l'existence du fichier
    if not Path(args.ontology).exists():
        print(f"❌ Fichier ontologie non trouvé : {args.ontology}")
        sys.exit(1)
    
    app = OntologieBurkinaFaso(args.ontology)
    app.run()

if __name__ == "__main__":
    main() 