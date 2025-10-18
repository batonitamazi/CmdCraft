import { Category } from "../types";

export const commandsData: { [key: string]: Category } = {
  'File System': {
    icon: '📁',
    commands: {
      'ls': {
        desc: 'List directory contents',
        args: [
          { name: '-l', desc: 'Long format', hasInput: false },
          { name: '-a', desc: 'Show hidden files', hasInput: false },
          { name: '-h', desc: 'Human readable sizes', hasInput: false },
          { name: 'path', desc: 'Directory path', hasInput: true, placeholder: '/path/to/dir' }
        ]
      },
      'cd': {
        desc: 'Change directory',
        args: [{ name: 'path', desc: 'Directory path', hasInput: true, placeholder: '/path/to/dir' }]
      },
      'pwd': { desc: 'Print working directory', args: [] },
      'mkdir': {
        desc: 'Create directory',
        args: [
          { name: '-p', desc: 'Create parent directories', hasInput: false },
          { name: 'dirname', desc: 'Directory name', hasInput: true, placeholder: 'new_folder' }
        ]
      },
      'rm': {
        desc: 'Remove files or directories',
        args: [
          { name: '-r', desc: 'Recursive', hasInput: false },
          { name: '-f', desc: 'Force', hasInput: false },
          { name: 'path', desc: 'File/directory path', hasInput: true, placeholder: 'file.txt' }
        ]
      },
      'cp': {
        desc: 'Copy files or directories',
        args: [
          { name: '-r', desc: 'Recursive', hasInput: false },
          { name: 'source', desc: 'Source path', hasInput: true, placeholder: 'source.txt' },
          { name: 'dest', desc: 'Destination path', hasInput: true, placeholder: 'dest.txt' }
        ]
      },
      'mv': {
        desc: 'Move or rename files',
        args: [
          { name: 'source', desc: 'Source path', hasInput: true, placeholder: 'old.txt' },
          { name: 'dest', desc: 'Destination path', hasInput: true, placeholder: 'new.txt' }
        ]
      },
      'touch': {
        desc: 'Create empty file or update timestamp',
        args: [{ name: 'filename', desc: 'File name', hasInput: true, placeholder: 'newfile.txt' }]
      },
      'cat': {
        desc: 'Display file contents',
        args: [{ name: 'filename', desc: 'File name', hasInput: true, placeholder: 'file.txt' }]
      },
      'find': {
        desc: 'Search for files',
        args: [
          { name: 'path', desc: 'Search path', hasInput: true, placeholder: '.' },
          { name: '-name', desc: 'File name pattern', hasInput: true, placeholder: '*.txt' }
        ]
      }
    }
  },
  'Text Processing': {
    icon: '📝',
    commands: {
      'grep': {
        desc: 'Search text patterns',
        args: [
          { name: '-i', desc: 'Case insensitive', hasInput: false },
          { name: '-r', desc: 'Recursive', hasInput: false },
          { name: 'pattern', desc: 'Search pattern', hasInput: true, placeholder: 'search_term' },
          { name: 'file', desc: 'File name', hasInput: true, placeholder: 'file.txt' }
        ]
      },
      'sed': {
        desc: 'Stream editor for text',
        args: [
          { name: 's/old/new/', desc: 'Substitution', hasInput: true, placeholder: 's/old/new/' },
          { name: 'file', desc: 'File name', hasInput: true, placeholder: 'file.txt' }
        ]
      },
      'awk': {
        desc: 'Pattern scanning and processing',
        args: [
          { name: 'pattern', desc: 'AWK pattern', hasInput: true, placeholder: '{print $1}' },
          { name: 'file', desc: 'File name', hasInput: true, placeholder: 'file.txt' }
        ]
      },
      'sort': {
        desc: 'Sort lines of text',
        args: [
          { name: '-r', desc: 'Reverse order', hasInput: false },
          { name: '-n', desc: 'Numeric sort', hasInput: false },
          { name: 'file', desc: 'File name', hasInput: true, placeholder: 'file.txt' }
        ]
      },
      'uniq': {
        desc: 'Remove duplicate lines',
        args: [
          { name: '-c', desc: 'Count occurrences', hasInput: false },
          { name: 'file', desc: 'File name', hasInput: true, placeholder: 'file.txt' }
        ]
      },
      'wc': {
        desc: 'Count words, lines, characters',
        args: [
          { name: '-l', desc: 'Count lines', hasInput: false },
          { name: '-w', desc: 'Count words', hasInput: false },
          { name: 'file', desc: 'File name', hasInput: true, placeholder: 'file.txt' }
        ]
      }
    }
  },
  'Networking': {
    icon: '🌐',
    commands: {
      'ping': {
        desc: 'Test network connectivity',
        args: [
          { name: '-c', desc: 'Count', hasInput: true, placeholder: '4' },
          { name: 'host', desc: 'Host address', hasInput: true, placeholder: 'google.com' }
        ]
      },
      'curl': {
        desc: 'Transfer data from URLs',
        args: [
          { name: '-X', desc: 'HTTP method', hasInput: true, placeholder: 'GET' },
          { name: '-H', desc: 'Header', hasInput: true, placeholder: 'Content-Type: application/json' },
          { name: 'url', desc: 'URL', hasInput: true, placeholder: 'https://api.example.com' }
        ]
      },
      'wget': {
        desc: 'Download files from web',
        args: [
          { name: '-O', desc: 'Output file', hasInput: true, placeholder: 'output.html' },
          { name: 'url', desc: 'URL', hasInput: true, placeholder: 'https://example.com' }
        ]
      },
      'ssh': {
        desc: 'Secure shell connection',
        args: [{ name: 'user@host', desc: 'User and host', hasInput: true, placeholder: 'user@server.com' }]
      },
      'scp': {
        desc: 'Secure copy files',
        args: [
          { name: 'source', desc: 'Source path', hasInput: true, placeholder: 'file.txt' },
          { name: 'user@host:path', desc: 'Destination', hasInput: true, placeholder: 'user@host:/path' }
        ]
      },
      'netstat': {
        desc: 'Network statistics',
        args: [
          { name: '-a', desc: 'All connections', hasInput: false },
          { name: '-n', desc: 'Numeric addresses', hasInput: false }
        ]
      }
    }
  },
  'System Info': {
    icon: '💻',
    commands: {
      'ps': {
        desc: 'Display running processes',
        args: [
          { name: 'aux', desc: 'All processes', hasInput: false },
          { name: '-ef', desc: 'Full format', hasInput: false }
        ]
      },
      'top': { desc: 'Display system tasks', args: [] },
      'df': {
        desc: 'Display disk space',
        args: [{ name: '-h', desc: 'Human readable', hasInput: false }]
      },
      'du': {
        desc: 'Estimate file space usage',
        args: [
          { name: '-h', desc: 'Human readable', hasInput: false },
          { name: '-s', desc: 'Summary', hasInput: false },
          { name: 'path', desc: 'Path', hasInput: true, placeholder: '.' }
        ]
      },
      'free': {
        desc: 'Display memory usage',
        args: [{ name: '-h', desc: 'Human readable', hasInput: false }]
      },
      'uname': {
        desc: 'Print system information',
        args: [{ name: '-a', desc: 'All information', hasInput: false }]
      },
      'whoami': { desc: 'Display current user', args: [] },
      'uptime': { desc: 'Show system uptime', args: [] }
    }
  },
  'Permissions': {
    icon: '🔐',
    commands: {
      'chmod': {
        desc: 'Change file permissions',
        args: [
          { name: 'mode', desc: 'Permission mode', hasInput: true, placeholder: '755' },
          { name: 'file', desc: 'File name', hasInput: true, placeholder: 'file.txt' }
        ]
      },
      'chown': {
        desc: 'Change file owner',
        args: [
          { name: 'user:group', desc: 'Owner', hasInput: true, placeholder: 'user:group' },
          { name: 'file', desc: 'File name', hasInput: true, placeholder: 'file.txt' }
        ]
      },
      'sudo': {
        desc: 'Execute command as superuser',
        args: [{ name: 'command', desc: 'Command to run', hasInput: true, placeholder: 'command' }]
      }
    }
  },
  'Archives': {
    icon: '📦',
    commands: {
      'tar': {
        desc: 'Archive files',
        args: [
          { name: '-czf', desc: 'Create gzip archive', hasInput: false },
          { name: '-xzf', desc: 'Extract gzip archive', hasInput: false },
          { name: 'archive', desc: 'Archive name', hasInput: true, placeholder: 'archive.tar.gz' },
          { name: 'files', desc: 'Files to archive', hasInput: true, placeholder: 'folder/' }
        ]
      },
      'zip': {
        desc: 'Compress files',
        args: [
          { name: '-r', desc: 'Recursive', hasInput: false },
          { name: 'archive', desc: 'Archive name', hasInput: true, placeholder: 'archive.zip' },
          { name: 'files', desc: 'Files to zip', hasInput: true, placeholder: 'folder/' }
        ]
      },
      'unzip': {
        desc: 'Extract zip files',
        args: [{ name: 'archive', desc: 'Archive name', hasInput: true, placeholder: 'archive.zip' }]
      }
    }
  }
}