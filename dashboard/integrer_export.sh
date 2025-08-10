#!/bin/bash

# Script d'intégration automatique des boutons d'export
# 📊 Intégration du bouton d'export dans toutes les pages CRUD

echo "🚀 Intégration des boutons d'export dans toutes les pages CRUD..."

# Fonction pour ajouter l'import si pas déjà présent
add_import_if_missing() {
    local file="$1"
    local import_line="import ExportButton from '../ui/ExportButton';"
    
    if ! grep -q "ExportButton" "$file"; then
        # Trouver la ligne après les imports existants
        sed -i '' "/import.*from.*LoadingSpinner/a\\
$import_line" "$file"
        echo "✅ Import ajouté dans $file"
    else
        echo "ℹ️  Import déjà présent dans $file"
    fi
}

# Fonction pour intégrer le bouton d'export
integrate_export_button() {
    local file="$1"
    local button_code="$2"
    local marker="$3"
    
    # Vérifier si le bouton n'est pas déjà intégré
    if ! grep -q "ExportButton" "$file"; then
        # Chercher la ligne avec le bouton d'ajout et insérer avant
        sed -i '' "/$marker/i\\
          $button_code\\
" "$file"
        echo "✅ Bouton d'export intégré dans $file"
    else
        echo "ℹ️  Bouton d'export déjà intégré dans $file"
    fi
}

# Pages à modifier
PAGES_DIR="src/components/pages"

# 1. Page Ethnies
echo "📝 Modification de EthniesPage.tsx..."
if [ -f "$PAGES_DIR/EthniesPage.tsx" ]; then
    add_import_if_missing "$PAGES_DIR/EthniesPage.tsx"
    
    # Ajouter le bouton d'export avant le bouton "Ajouter"
    ETHNIES_BUTTON='          <ExportButton
            data={filteredEthnies}
            filename="ethnies_burkina_faso"
            type="ethnies"
            title="Ethnies du Burkina Faso"
          />'
    
    integrate_export_button "$PAGES_DIR/EthniesPage.tsx" "$ETHNIES_BUTTON" "Ajouter une ethnie"
fi

# 2. Page Langues
echo "📝 Modification de LanguesPage.tsx..."
if [ -f "$PAGES_DIR/LanguesPage.tsx" ]; then
    add_import_if_missing "$PAGES_DIR/LanguesPage.tsx"
    
    LANGUES_BUTTON='          <ExportButton
            data={filteredLangues}
            filename="langues_burkina_faso"
            type="langues"
            title="Langues du Burkina Faso"
          />'
    
    integrate_export_button "$PAGES_DIR/LanguesPage.tsx" "$LANGUES_BUTTON" "Ajouter une langue"
fi

# 3. Page Régions
echo "📝 Modification de RegionsPage.tsx..."
if [ -f "$PAGES_DIR/RegionsPage.tsx" ]; then
    add_import_if_missing "$PAGES_DIR/RegionsPage.tsx"
    
    REGIONS_BUTTON='          <ExportButton
            data={filteredRegions}
            filename="regions_burkina_faso"
            type="regions"
            title="Régions Administratives du Burkina Faso"
          />'
    
    integrate_export_button "$PAGES_DIR/RegionsPage.tsx" "$REGIONS_BUTTON" "Nouvelle Région"
fi

# 4. Page Patronymes
echo "📝 Modification de PatronymesPage.tsx..."
if [ -f "$PAGES_DIR/PatronymesPage.tsx" ]; then
    add_import_if_missing "$PAGES_DIR/PatronymesPage.tsx"
    
    PATRONYMES_BUTTON='          <ExportButton
            data={filteredPatronymes}
            filename="patronymes_burkina_faso"
            type="patronymes"
            title="Patronymes du Burkina Faso"
          />'
    
    integrate_export_button "$PAGES_DIR/PatronymesPage.tsx" "$PATRONYMES_BUTTON" "Nouveau Patronyme"
fi

# 5. Page Dialectes
echo "📝 Modification de DialectesPage.tsx..."
if [ -f "$PAGES_DIR/DialectesPage.tsx" ]; then
    add_import_if_missing "$PAGES_DIR/DialectesPage.tsx"
    
    DIALECTES_BUTTON='          <ExportButton
            data={filteredDialectes}
            filename="dialectes_burkina_faso"
            type="dialectes"
            title="Dialectes du Burkina Faso"
          />'
    
    integrate_export_button "$PAGES_DIR/DialectesPage.tsx" "$DIALECTES_BUTTON" "Nouveau Dialecte"
fi

echo ""
echo "🎉 Intégration terminée !"
echo "✅ Boutons d'export ajoutés dans toutes les pages CRUD"
echo "🔧 Format disponibles : CSV, Excel, PDF"
echo "📄 Consultez GUIDE_INTEGRATION_EXPORT.md pour plus d'informations"
echo ""
echo "🚀 Redémarrez le serveur de développement pour voir les changements :"
echo "   cd ontologie-web/dashboard && npm run dev"
