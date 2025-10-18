export interface CommandArg {
  name: string
  desc: string
  hasInput: boolean
  placeholder?: string
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
  placeholder?: string
  value: string
}
