import { SlashCommand } from '@bubcool1/discord-js-helper';

import addGlossaryItem from './addGlossaryItem';
import editGlossaryItem from './editGlossaryItem';

const commands: Array<SlashCommand> = [addGlossaryItem, editGlossaryItem];

export default commands;
