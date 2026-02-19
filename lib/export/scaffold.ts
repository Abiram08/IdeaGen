import type { ProjectScaffold } from '@/types/idea';
import JSZip from 'jszip';

export async function downloadScaffoldZip(
  scaffold: ProjectScaffold,
  projectName: string
): Promise<void> {
  const zip = new JSZip();
  const folderName = projectName
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();

  const root = zip.folder(folderName)!;

  // Add all scaffold files
  for (const file of scaffold.files) {
    root.file(file.path, file.content);
  }

  // Add README
  if (scaffold.readme_content) {
    root.file('README.md', scaffold.readme_content);
  }

  // Add setup script
  if (scaffold.setup_commands.length > 0) {
    const setupScript = scaffold.setup_commands.join('\n');
    root.file('setup.sh', `#!/bin/bash\n${setupScript}\n`);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folderName}-starter.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
