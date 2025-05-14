import React, { useState } from 'react';

interface SocialShareButtonsProps {
  score: number;
  categoryName: string;
  gameUrl: string;
  categoryImageUrl?: string; // Opcional, para futura referencia o si el gameUrl usa metadatos
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  score,
  categoryName,
  gameUrl,
  // categoryImageUrl, // No se usa directamente en los enlaces de compartir más comunes
}) => {
  const baseText = `¡He obtenido ${score} puntos en la categoría '${categoryName}' en #GeoGame! ¿Puedes superarme?`;

  const handleShareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      baseText
    )}&url=${encodeURIComponent(gameUrl)}&hashtags=GeoGame`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`;
    // Facebook toma el texto y la imagen de las metaetiquetas Open Graph de la gameUrl
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(gameUrl)}`;
    // LinkedIn también toma el título, descripción e imagen de las metaetiquetas Open Graph de la gameUrl
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  // Para Mastodon, es mejor que el usuario copie el texto, ya que se necesita la instancia.
  // Podríamos usar un prompt o un campo de texto si quisiéramos que el usuario ingrese su instancia.
  const [mastodonTextCopied, setMastodonTextCopied] = useState(false);
  const mastodonShareText = `${baseText} ${gameUrl}`;

  const handleCopyToClipboardForMastodon = () => {
    navigator.clipboard.writeText(mastodonShareText).then(() => {
      setMastodonTextCopied(true);
      setTimeout(() => setMastodonTextCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Error al copiar al portapapeles: ', err);
      // Fallback por si el portapapeles no funciona (ej. HTTP)
      alert("No se pudo copiar. Por favor, selecciona y copia manualmente el siguiente texto:\n\n" + mastodonShareText);
    });
  };

  return (
    <div className="social-share-buttons" style={{ marginTop: '20px', textAlign: 'center' }}>
      <h4>Compartir resultado:</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        <button onClick={handleShareToTwitter} title="Compartir en Twitter (X)">
          Twitter (X)
        </button>
        <button onClick={handleShareToFacebook} title="Compartir en Facebook">
          Facebook
        </button>
        <button onClick={handleShareToLinkedIn} title="Compartir en LinkedIn">
          LinkedIn
        </button>
        <button onClick={handleCopyToClipboardForMastodon} title="Copiar texto para Mastodon">
          {mastodonTextCopied ? '¡Copiado para Mastodon!' : 'Mastodon (Copiar)'}
        </button>
      </div>
      {/* Instagram no es viable para compartir directamente desde web a un post del feed.
          Se podría considerar un enlace a un perfil si fuera relevante. */}
    </div>
  );
};

export default SocialShareButtons; 