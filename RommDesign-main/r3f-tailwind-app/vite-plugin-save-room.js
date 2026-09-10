import fs from 'fs';
import path from 'path';

/**
 * Format a number to avoid long decimals (e.g., 3.1415926535... -> 3.142)
 */
function fmt(num) {
  return Number(num.toFixed(3));
}

/**
 * Replaces the `room: { ... },` block after a specific index.
 */
function replaceRoomBlock(content, startIndex, newRoom) {
  const roomKeyIndex = content.indexOf('room: {', startIndex);
  if (roomKeyIndex === -1) return content;
  
  const closingBraceIndex = content.indexOf('},', roomKeyIndex);
  if (closingBraceIndex === -1) return content;

  const newRoomStr = `room: {
    width: ${fmt(newRoom.width)},
    depth: ${fmt(newRoom.depth)},
    height: ${fmt(newRoom.height)},
    wallColor: '${newRoom.wallColor}',
    floorColor: '${newRoom.floorColor}',
    ceilingColor: '${newRoom.ceilingColor}',
    wallThickness: ${fmt(newRoom.wallThickness)},
  },`;

  return content.substring(0, roomKeyIndex) + newRoomStr + content.substring(closingBraceIndex + 2);
}

/**
 * Replaces the `furniture: () => [ ... ],` block after a specific index.
 */
function replaceFurnitureBlock(content, startIndex, newFurniture) {
  const furnKeyIndex = content.indexOf('furniture: () => [', startIndex);
  if (furnKeyIndex === -1) return content;
  
  // To safely find the matching closing bracket for `furniture: () => [`, 
  // we look for the specific indentation `  ],` that closes the block.
  // Alternatively, we can count brackets.
  let depth = 0;
  let closingBracketIndex = -1;
  const arrayStartIndex = furnKeyIndex + 'furniture: () => '.length;
  
  for (let i = arrayStartIndex; i < content.length; i++) {
    if (content[i] === '[') depth++;
    else if (content[i] === ']') {
      depth--;
      if (depth === 0) {
        // We found the matching closing bracket
        // We expect it to be followed by a comma, e.g., `],`
        if (content[i + 1] === ',') {
           closingBracketIndex = i;
           break;
        }
      }
    }
  }

  if (closingBracketIndex === -1) return content;

  const furnLines = newFurniture.filter(f => f.visible !== false).map(f => {
    const pos = `[${fmt(f.position[0])}, ${fmt(f.position[1])}, ${fmt(f.position[2])}]`;
    
    // Check if rotation is default [0,0,0]
    const r = f.rotation;
    const isDefRot = r[0] === 0 && r[1] === 0 && r[2] === 0;
    const rot = isDefRot ? '' : `, [${fmt(r[0])}, ${fmt(r[1])}, ${fmt(r[2])}]`;
    
    // Check if scale is default [1,1,1]
    const s = f.scale;
    const isDefScale = s[0] === 1 && s[1] === 1 && s[2] === 1;
    
    let scale = '';
    if (!isDefScale) {
      if (isDefRot) {
        scale = `, [0, 0, 0], [${fmt(s[0])}, ${fmt(s[1])}, ${fmt(s[2])}]`;
      } else {
        scale = `, [${fmt(s[0])}, ${fmt(s[1])}, ${fmt(s[2])}]`;
      }
    }

    return `    f('${f.registryId}', ${pos}${rot}${scale}),`;
  });

  const newFurnStr = `furniture: () => [\n${furnLines.join('\n')}\n  ],`;

  return content.substring(0, furnKeyIndex) + newFurnStr + content.substring(closingBracketIndex + 2);
}

export default function saveRoomPlugin() {
  return {
    name: 'save-room',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-room' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { templateId, room, furniture } = JSON.parse(body);
              const filePath = path.resolve(process.cwd(), 'src/data/roomTemplates.js');
              
              if (!fs.existsSync(filePath)) {
                res.statusCode = 404;
                return res.end('roomTemplates.js not found');
              }

              let content = fs.readFileSync(filePath, 'utf-8');
              const templateIdIndex = content.indexOf(`id: '${templateId}'`);
              
              if (templateIdIndex === -1) {
                res.statusCode = 404;
                return res.end('Template ID not found in file');
              }

              content = replaceRoomBlock(content, templateIdIndex, room);
              
              // We need to find the templateIdIndex again because the string length changed
              const newTemplateIdIndex = content.indexOf(`id: '${templateId}'`);
              content = replaceFurnitureBlock(content, newTemplateIdIndex, furniture);

              fs.writeFileSync(filePath, content, 'utf-8');
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              console.error('Save room error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}
