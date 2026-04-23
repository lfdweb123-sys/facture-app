export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Politique de Confidentialité</h1>
        <p className="text-xs text-gray-500 mt-0.5">Dernière mise à jour : 23 Avril 2026</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 prose prose-sm max-w-none text-gray-600 space-y-4">
        <h3 className="text-gray-900 font-semibold">1. Collecte des données</h3>
        <p>Nous collectons les informations nécessaires à la fourniture de nos services : nom, email, téléphone, documents de vérification, factures et contrats. Ces données sont stockées de manière sécurisée sur Firebase (Google Cloud).</p>
        
        <h3 className="text-gray-900 font-semibold">2. Utilisation des données</h3>
        <p>Vos données sont utilisées exclusivement pour : la création et l'envoi de factures, la génération de contrats, la vérification d'identité, le traitement des paiements et l'amélioration de nos services.</p>
        
        <h3 className="text-gray-900 font-semibold">3. Partage des données</h3>
        <p>Nous ne vendons ni ne partageons vos données personnelles avec des tiers. Les informations figurant sur vos factures sont partagées uniquement avec les destinataires que vous désignez.</p>
        
        <h3 className="text-gray-900 font-semibold">4. Sécurité</h3>
        <p>Toutes les données sont chiffrées en transit (TLS) et au repos (AES-256). Nous utilisons des mesures de sécurité conformes aux standards de l'industrie.</p>
        
        <h3 className="text-gray-900 font-semibold">5. Vos droits</h3>
        <p>Conformément aux réglementations en vigueur, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Contactez-nous à privacy@factureapp.com.</p>
        
        <h3 className="text-gray-900 font-semibold">6. Contact</h3>
        <p>Pour toute question relative à cette politique : privacy@factureapp.com</p>
      </div>
    </div>
  );
}