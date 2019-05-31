// Paste this on dev console in https://icanhazwordz.appspot.com/
fetch('https://icanhazwordz.appspot.com/dictionary.words')
    .then(response => response.text())
    .then(text => text.split('\n'))
    .then(words => words.map(w => w.trim().toUpperCase().replace('QU', 'Q')))
    .then(words => words.filter(word => word.length > 0))
    .then(words => {
      function makeAbcCountTree(words, abcIndex, score) {
        const targetChar = String.fromCharCode('A'.charCodeAt(0) + abcIndex);
        const tree = [];
        for (let word of words) {
          let count = 0;
          for (let char of word) {
            if (char == targetChar) count++;
          }
          while (tree.length <= count) {
            tree.push([]);
          }
          tree[count].push(word);
        }
        const charScore = Number("11211212133221123111122323"[abcIndex]);
        for (let i = 0; i < tree.length; i++) {
          let nextScore = score + charScore * i;
          tree[i] = abcIndex < 25
            ? makeAbcCountTree(tree[i], abcIndex + 1, nextScore)
            : tree[i].map(w => ({word: w, score: nextScore * nextScore}));
        }
        return tree;
      }
      return makeAbcCountTree(words, 0, 1);
    })
    .then(tree => {
      function findBest(treeNode, abcCounts, abcIndex) {
        if (treeNode.length == 0) {
          return null;
        } else if (treeNode[0].hasOwnProperty('word')) {
          return treeNode[0];
        }
        let best = null;
        for (var i = 0; i <= abcCounts[abcIndex] && i < treeNode.length; i++) {
          let current = findBest(treeNode[i], abcCounts, abcIndex + 1);
          if (current != null && (best == null || current.score > best.score)) {
            best = current;
          }
        }
        return best;
      }
      return abcCounts => findBest(tree, abcCounts, 0).word.replace('Q', 'QU');
    })
    .then(findBestByAbcCounts => {
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.addEventListener('load', function() {
        const doc = iframe.contentDocument;
        if (doc.querySelector('input[name=NickName]')) {
          let score;
          doc.querySelectorAll('td').forEach(td => {
            if (td.textContent == "Score") {
              score = td.nextSibling.textContent;
            }
          });
          doc.querySelector('input[name=NickName]').value = 'Nobuki';
          doc.querySelector('#AgentRobot').checked = true;
          doc.querySelector('input[name=Name]').value = 'Nobuki Yoda';
          doc.querySelector('input[name=Email]').value = 'TODO';
          if (score > 2000) {
            doc.querySelector('form').submit();
          } else {
            iframe.src = '/';
          }
          return;
        }
        const alphabets = Array.from(
            doc.querySelectorAll('.letter'),
            elem => elem.textContent.charCodeAt(0) - 'A'.charCodeAt(0));
        const counts = new Array(26).fill(0).map(
            (_, i) => alphabets.filter(j => j == i).length);
        const answer = findBestByAbcCounts(counts);
        doc.querySelector('#MoveField').value = answer;
        doc.querySelector('form').submit();
      });
      iframe.src = '/';
      document.body.innerHTML = '';
      document.body.appendChild(iframe);
    });
