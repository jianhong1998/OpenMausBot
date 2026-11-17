const fs = require('fs');
const f = '/app/dist-server/index.js';
let s = fs.readFileSync(f, 'utf8');

// 1. Replace bind mount source in docker run args with host-visible path.
//    mkdir still uses workspaceDir (container path); only --mount source gets the host path.
s = s.replace(
  /type=bind,source=\$\{target4\.workspaceDir\}/g,
  'type=bind,source=${process.env.OMB_HOST_DATA_DIR?target4.workspaceDir.replace(DATA_DIR,process.env.OMB_HOST_DATA_DIR):target4.workspaceDir}'
);

// 2. Replace expectedWorkspace in dockerWorkspaceMountIsSafe call with host-path equivalent,
//    so the mount source validation accepts the host-side path the daemon recorded.
s = s.replace(
  /dockerWorkspaceMountIsSafe\(detail\?\.Mounts,platform2,target4\.workspaceDir,/g,
  'dockerWorkspaceMountIsSafe(detail?.Mounts,platform2,process.env.OMB_HOST_DATA_DIR?target4.workspaceDir.replace(DATA_DIR,process.env.OMB_HOST_DATA_DIR):target4.workspaceDir,'
);

fs.writeFileSync(f, s);
console.log('patch applied, occurrences:', (s.match(/OMB_HOST_DATA_DIR/g)||[]).length);
