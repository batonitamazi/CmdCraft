export interface CommandArg {
  name: string
  desc: string
  hasInput: boolean
  placeholder?: string
  openFileDialog?: boolean
}

export interface Command {
  desc: string
  args: CommandArg[]
}

export interface Category {
  icon: string
  commands: { [key: string]: Command }
}

export interface Block {
  id: number
  type: 'command' | 'arg'
  command: string
  arg?: string
  hasInput?: boolean
  placeholder?: string,
  openFileDialog?: boolean
  value: string
  groupId: number
}
