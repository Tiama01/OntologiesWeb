#!/bin/bash

# 🚀 SCRIPT DE DÉMARRAGE NEO4J
# Script pour installer, configurer et démarrer Neo4j

set -e

echo "🎯 DÉMARRAGE NEO4J POUR ONTOLOGIE ETHNOLINGUISTIQUE"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Détection du système d'exploitation
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "debian"
        elif [ -f /etc/redhat-release ]; then
            echo "redhat"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Installation de Neo4j selon le système
install_neo4j() {
    local os=$(detect_os)
    
    case $os in
        "macos")
            print_status "Installation sur macOS..."
            if ! command -v brew &> /dev/null; then
                print_error "Homebrew n'est pas installé. Installez-le d'abord."
                exit 1
            fi
            
            if ! command -v neo4j &> /dev/null; then
                print_status "Installation de Neo4j via Homebrew..."
                brew install neo4j
                print_success "Neo4j installé via Homebrew"
            else
                print_warning "Neo4j est déjà installé"
            fi
            ;;
            
        "debian")
            print_status "Installation sur Debian/Ubuntu..."
            if ! command -v neo4j &> /dev/null; then
                print_status "Ajout du repository Neo4j..."
                wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
                echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list
                
                print_status "Mise à jour des paquets..."
                sudo apt-get update
                
                print_status "Installation de Neo4j..."
                sudo apt-get install -y neo4j
                print_success "Neo4j installé via apt"
            else
                print_warning "Neo4j est déjà installé"
            fi
            ;;
            
        "redhat")
            print_status "Installation sur RedHat/CentOS..."
            if ! command -v neo4j &> /dev/null; then
                print_error "Installation manuelle requise sur RedHat/CentOS"
                print_status "Consultez: https://neo4j.com/docs/operations-manual/current/installation/linux/rpm/"
                exit 1
            else
                print_warning "Neo4j est déjà installé"
            fi
            ;;
            
        "windows")
            print_status "Installation sur Windows..."
            print_error "Installation manuelle requise sur Windows"
            print_status "Téléchargez Neo4j Desktop depuis: https://neo4j.com/download/"
            exit 1
            ;;
            
        *)
            print_error "Système d'exploitation non supporté: $os"
            exit 1
            ;;
    esac
}

# Configuration de Neo4j
configure_neo4j() {
    print_status "Configuration de Neo4j..."
    
    # Déterminer le chemin de configuration
    local config_path=""
    if [[ "$(detect_os)" == "macos" ]]; then
        config_path="/usr/local/etc/neo4j/neo4j.conf"
    elif [[ "$(detect_os)" == "debian" ]]; then
        config_path="/etc/neo4j/neo4j.conf"
    fi
    
    if [ -n "$config_path" ] && [ -f "$config_path" ]; then
        print_status "Configuration trouvée: $config_path"
        
        # Sauvegarde de la configuration
        sudo cp "$config_path" "${config_path}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Configuration recommandée
        print_status "Application de la configuration recommandée..."
        
        # Vérifier si les paramètres sont déjà configurés
        if ! grep -q "dbms.memory.heap.max_size=2G" "$config_path"; then
            echo "" | sudo tee -a "$config_path"
            echo "# Configuration pour l'ontologie ethnolinguistique" | sudo tee -a "$config_path"
            echo "dbms.memory.heap.initial_size=1G" | sudo tee -a "$config_path"
            echo "dbms.memory.heap.max_size=2G" | sudo tee -a "$config_path"
            echo "dbms.memory.pagecache.size=1G" | sudo tee -a "$config_path"
            echo "dbms.security.procedures.unrestricted=apoc.*" | sudo tee -a "$config_path"
        fi
        
        print_success "Configuration appliquée"
    else
        print_warning "Fichier de configuration non trouvé. Configuration manuelle requise."
    fi
}

# Démarrage de Neo4j
start_neo4j() {
    print_status "Démarrage de Neo4j..."
    
    local os=$(detect_os)
    
    case $os in
        "macos")
            if command -v brew &> /dev/null; then
                brew services start neo4j
                print_success "Neo4j démarré via Homebrew services"
            else
                print_error "Impossible de démarrer Neo4j"
                exit 1
            fi
            ;;
            
        "debian"|"redhat")
            sudo systemctl start neo4j
            sudo systemctl enable neo4j
            print_success "Neo4j démarré via systemctl"
            ;;
            
        *)
            print_error "Démarrage manuel requis"
            exit 1
            ;;
    esac
}

# Vérification du statut
check_status() {
    print_status "Vérification du statut de Neo4j..."
    
    # Attendre que Neo4j démarre
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:7474 > /dev/null 2>&1; then
            print_success "Neo4j est accessible sur http://localhost:7474"
            break
        fi
        
        print_status "Tentative $attempt/$max_attempts - Attente du démarrage..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Neo4j n'a pas démarré dans le délai imparti"
        exit 1
    fi
}

# Installation des dépendances Python
install_python_deps() {
    print_status "Installation des dépendances Python..."
    
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
        print_success "Dépendances Python installées"
    else
        print_warning "Fichier requirements.txt non trouvé"
    fi
}

# Migration des données
migrate_data() {
    print_status "Migration des données vers Neo4j..."
    
    if [ -f "migration_neo4j.py" ]; then
        print_status "Exécution du script de migration..."
        python3 migration_neo4j.py
        print_success "Migration terminée"
    else
        print_warning "Script de migration non trouvé"
    fi
}

# Test de l'API
test_api() {
    print_status "Test de l'API..."
    
    # Démarrer l'API en arrière-plan
    if [ -f "main.py" ]; then
        print_status "Démarrage de l'API FastAPI..."
        nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > api.log 2>&1 &
        local api_pid=$!
        
        # Attendre que l'API démarre
        sleep 5
        
        # Test de l'API
        if curl -s http://localhost:8000/api/neo4j/health > /dev/null 2>&1; then
            print_success "API accessible sur http://localhost:8000"
            print_status "PID de l'API: $api_pid"
        else
            print_warning "API non accessible"
        fi
    else
        print_warning "Fichier main.py non trouvé"
    fi
}

# Affichage des informations finales
show_info() {
    echo ""
    echo "🎉 INSTALLATION TERMINÉE"
    echo "========================"
    echo ""
    echo "📊 Neo4j Browser: http://localhost:7474"
    echo "   - Username: neo4j"
    echo "   - Password: neo4j (changez-le au premier accès)"
    echo ""
    echo "🔌 API REST: http://localhost:8000"
    echo "   - Documentation: http://localhost:8000/docs"
    echo "   - Health check: http://localhost:8000/api/neo4j/health"
    echo ""
    echo "📁 Fichiers créés:"
    echo "   - migration_neo4j.py: Script de migration"
    echo "   - services/neo4j_service.py: Service Neo4j"
    echo "   - routes/neo4j_routes.py: Routes API"
    echo "   - GUIDE_NEO4J.md: Guide complet"
    echo ""
    echo "🚀 Commandes utiles:"
    echo "   - Arrêter Neo4j: brew services stop neo4j (macOS) ou sudo systemctl stop neo4j (Linux)"
    echo "   - Redémarrer Neo4j: brew services restart neo4j (macOS) ou sudo systemctl restart neo4j (Linux)"
    echo "   - Logs Neo4j: tail -f /usr/local/var/log/neo4j/neo4j.log (macOS) ou sudo journalctl -u neo4j -f (Linux)"
    echo ""
}

# Fonction principale
main() {
    print_status "Démarrage de l'installation..."
    
    # Installation
    install_neo4j
    
    # Configuration
    configure_neo4j
    
    # Démarrage
    start_neo4j
    
    # Vérification
    check_status
    
    # Dépendances Python
    install_python_deps
    
    # Migration (optionnelle)
    read -p "Voulez-vous migrer les données maintenant ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        migrate_data
    fi
    
    # Test API (optionnel)
    read -p "Voulez-vous tester l'API maintenant ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_api
    fi
    
    # Informations finales
    show_info
}

# Exécution du script
main "$@" 