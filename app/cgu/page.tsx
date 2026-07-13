'use client'
import Navbar from '@/components/Navbar'

const SECTIONS = [
  {
    title: '1. Objet',
    content:
      "Les présentes conditions régissent l'utilisation du statut « organisateur » sur la plateforme. En soumettant une candidature pour devenir organisateur, vous acceptez l'ensemble des règles décrites ci-dessous.",
  },
  {
    title: '2. Éligibilité',
    content:
      "Le statut d'organisateur peut être demandé par toute personne physique ou morale (association, entreprise, particulier) souhaitant créer et publier des événements sur la plateforme. La validation de la candidature est soumise à l'approbation d'un administrateur.",
  },
  {
    title: '3. Informations fournies',
    content:
      "Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre candidature (email de contact, téléphone, nom et type d'organisation). Toute information erronée ou trompeuse pourra entraîner le refus ou la suspension du statut d'organisateur.",
  },
  {
    title: '4. Responsabilités de l\'organisateur',
    content:
      "En tant qu'organisateur, vous êtes seul responsable du contenu des événements que vous publiez : exactitude des informations (date, lieu, prix), respect des lois en vigueur, et bonne tenue de l'événement annoncé. La plateforme agit uniquement comme intermédiaire de mise en relation.",
  },
  {
    title: '5. Conduite attendue',
    content:
      "L'organisateur s'engage à ne publier aucun événement à caractère illégal, trompeur, discriminatoire ou dangereux. Toute réservation annulée par un participant doit être traitée de bonne foi. Tout manquement constaté pourra entraîner le retrait du statut d'organisateur.",
  },
  {
    title: '6. Validation et refus',
    content:
      "Chaque candidature est examinée manuellement. La plateforme se réserve le droit d'accepter ou de refuser une candidature sans obligation de justification détaillée, ainsi que de révoquer le statut d'organisateur en cas de non-respect de la présente charte.",
  },
  {
    title: '7. Données personnelles',
    content:
      "Les informations transmises lors de la candidature (email, téléphone, nom d'organisation) sont utilisées exclusivement dans le cadre du traitement de votre demande et de la gestion de votre compte organisateur.",
  },
  {
    title: '8. Modification des conditions',
    content:
      "Ces conditions peuvent être mises à jour à tout moment. Les organisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation du statut d'organisateur après modification vaut acceptation des nouvelles conditions.",
  },
]

export default function CguPage() {
  return (
    <div style={{ backgroundColor: '#EFEDE6', minHeight: '100vh' }}>
      <Navbar variant="full" />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E4E2DA', padding: '28px 32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18', marginBottom: '4px' }}>
            Conditions générales & charte des organisateurs
          </h1>
          <p style={{ fontSize: '11px', color: '#7A7A74', marginBottom: '24px' }}>
            Dernière mise à jour : juillet 2026
          </p>

          {SECTIONS.map((section, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A18', marginBottom: '6px' }}>
                {section.title}
              </h2>
              <p style={{ fontSize: '12px', color: '#4A4A45', lineHeight: 1.7 }}>
                {section.content}
              </p>
            </div>
          ))}

          <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #E4E2DA' }}>
            <p style={{ fontSize: '11px', color: '#7A7A74' }}>
              Pour toute question concernant ces conditions, contacte-nous via la page support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}