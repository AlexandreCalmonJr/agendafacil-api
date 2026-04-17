const express = require('express');
const router = express.Router();
const https = require('https');

// Função auxiliar para buscar dados HTTPS (Proxy)
function fetchHttps(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

// Rota para Notícias de Saúde (G1)
router.get('/saude', async (req, res) => {
  try {
    const rssG1 = 'https://g1.globo.com/rss/g1/ciencia-e-saude/';
    const xmlData = await fetchHttps(rssG1);
    
    // Parse simplificado de XML via Regex (para evitar instalação de dependências pesadas)
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlData)) !== null && items.length < 10) {
      const content = match[1];
      const title = content.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || 
                    content.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      const link = content.match(/<link>([\s\S]*?)<\/link>/)?.[1];
      const pubDate = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
      const description = content.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
                          content.match(/<description>([\s\S]*?)<\/description>/)?.[1];
      
      // Tenta extrair imagem do feed (G1 coloca em media:content ou as vezes no corpo)
      let imageUrl = content.match(/<media:content[^>]*url="([\s\S]*?)"/)?.[1] || 
                     content.match(/<img[^>]*src="([\s\S]*?)"/)?.[1];

      if (title && link) {
        // Limpeza profunda da descrição
        let excerpt = description ? description.replace(/<[^>]*>?/gm, '') : '';
        excerpt = excerpt.replace(/]]?>/g, '') // Remove resíduos de CDATA
                         .replace(/&quot;/g, '"')
                         .replace(/&amp;/g, '&')
                         .replace(/&nbsp;/g, ' ')
                         .replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .trim();

        // Tenta remover créditos comuns no início
        if (excerpt.length > 200) {
            excerpt = excerpt.slice(0, 180) + '...';
        }

        items.push({
          title: title.replace(']]>', '').trim(),
          link: link.trim(),
          date: pubDate ? new Date(pubDate).toLocaleDateString('pt-BR') : '',
          excerpt: excerpt,
          image: imageUrl || null
        });
      }
    }
    
    res.json(items);
  } catch (error) {
    console.error('Erro ao buscar notícias G1:', error);
    res.status(500).json({ erro: 'Falha ao buscar notícias de saúde' });
  }
});

// Rota para Novidades da Clínica
router.get('/clinica', (req, res) => {
  // Dados simulados de alta qualidade (Poderiam vir do Banco de Dados futuramente)
  const novidades = [
    {
      id: 1,
      title: "Expansão da Unidade Centro",
      date: "17 de Abril, 2024",
      excerpt: "Inauguramos 5 novas salas de exames e uma recepção ampliada para seu maior conforto.",
      category: "Infraestrutura",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Programa Descontos em Check-ups",
      date: "10 de Abril, 2024",
      excerpt: "Durante todo este mês, pacotes de check-up preventivo terão condições especiais.",
      category: "Campanha",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Nota Máxima no Selo de Qualidade",
      date: "05 de Abril, 2024",
      excerpt: "Fomos reconhecidos pela 3ª vez consecutiva pela excelência no atendimento humanizado.",
      category: "Prêmio",
      image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800"
    }
  ];
  res.json(novidades);
});

module.exports = router;
