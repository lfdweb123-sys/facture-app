export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mentions légales</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 prose prose-sm max-w-none text-gray-600 space-y-4">
        
        <h3 className="text-gray-900 font-semibold">Présentation du site</h3>
        <p>
          Ce site propose des services en ligne accessibles aux utilisateurs via internet.
          L’utilisation du site implique l’acceptation des conditions décrites ci-dessous.
        </p>

        <h3 className="text-gray-900 font-semibold">Accès au service</h3>
        <p>
          Le site est accessible à tout moment, sauf interruption pour maintenance,
          mise à jour ou cas de force majeure.
        </p>

        <h3 className="text-gray-900 font-semibold">Responsabilité</h3>
        <p>
          Les informations fournies sur le site sont données à titre indicatif.
          L’éditeur ne peut être tenu responsable des erreurs, omissions ou
          indisponibilités du service.
        </p>

        <h3 className="text-gray-900 font-semibold">Données personnelles</h3>
        <p>
          Les données collectées sont utilisées uniquement dans le cadre du service.
          Elles ne sont pas vendues ni cédées à des tiers sans consentement.
        </p>

        <h3 className="text-gray-900 font-semibold">Cookies</h3>
        <p>
          Le site peut utiliser des cookies pour améliorer l’expérience utilisateur
          et analyser l’utilisation du service.
        </p>

        <h3 className="text-gray-900 font-semibold">Propriété intellectuelle</h3>
        <p>
          Les contenus présents sur le site (textes, images, éléments graphiques)
          sont protégés. Toute reproduction ou utilisation sans autorisation est interdite.
        </p>

        <h3 className="text-gray-900 font-semibold">Modification</h3>
        <p>
          Les présentes mentions légales peuvent être modifiées à tout moment.
          Les utilisateurs sont invités à les consulter régulièrement.
        </p>

      </div>
    </div>
  );
}