import { colors } from '../../lib/theme';
import Icon from '../icons/Icon';

export default function Spinner({ size = 20, color = colors.gold }) {
  return <Icon name="loader" size={size} color={color} style={{ animation: 'spin 1s linear infinite' }} />;
}
