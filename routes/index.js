module.exports = (app, addon) => {
    app.get('/report', addon.authenticate(), async (req, res) => {
      const repo = req.query.repo; // Örnek: workspace/repo_slug
      const httpClient = addon.httpClient(req);
      const commitsUrl = `/2.0/repositories/${repo}/commits`;
  
      httpClient.get(commitsUrl, async (err, response, body) => {
        if (err) return res.send('Hata: ' + err.message);
  
        const commits = JSON.parse(body).values;
        const stats = {};
  
        for (const commit of commits) {
          const author = commit.author?.raw || 'Unknown';
          const commitUrl = `/2.0/repositories/${repo}/commit/${commit.hash}`;
  
          // Satır istatistiği için detaylı commit çağrısı
          await new Promise(resolve => {
            httpClient.get(commitUrl, (err2, res2, body2) => {
              if (!err2) {
                const detail = JSON.parse(body2);
                const added = detail.summary?.raw.match(/\+(\d+)/)?.[1] || 0;
                const removed = detail.summary?.raw.match(/\-(\d+)/)?.[1] || 0;
  
                stats[author] = stats[author] || { commits: 0, added: 0, removed: 0 };
                stats[author].commits += 1;
                stats[author].added += parseInt(added);
                stats[author].removed += parseInt(removed);
              }
              resolve();
            });
          });
        }
  
        res.render('report', { stats });
      });
    });
  };
  