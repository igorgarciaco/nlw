import React, { useState } from 'react';
import { View, Modal, ModalProps, Text, TouchableOpacity, ToastAndroid, ActivityIndicator } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons'
import { CheckCircle } from 'phosphor-react-native'

import * as Clipboard from 'expo-clipboard'

import { styles } from './styles';
import { THEME } from '../../theme';
import { Heading } from '../Heading';

interface Props extends ModalProps {
  discord: string;
  onClose: () => void;
}

export function DuoMatch({ discord, onClose, ...rest }: Props) {
  const [isCopping, setIsCopping] = useState(false)

  async function handleCopyDiscordToClipboard() {
    setIsCopping(true)
    await Clipboard.setStringAsync(discord);

    ToastAndroid.showWithGravityAndOffset('Discord Copiado', ToastAndroid.SHORT, ToastAndroid.TOP, 0, 100)
    setIsCopping(false)
  }

  return (
    <Modal transparent statusBarTranslucent animationType="fade" {...rest}>
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <MaterialIcons name="close" size={20} color={THEME.COLORS.CAPTION_500}/>
          </TouchableOpacity>

          <CheckCircle size={64} color={THEME.COLORS.SUCCESS} weight="bold" />

          <Heading title="Let's play!" subtitle='Agora é começar a jogar!' style={styles.heading}/>
          
          <Text style={styles.label}>
            Adicione no Discord
          </Text>

          <TouchableOpacity style={styles.discordButton} onPress={handleCopyDiscordToClipboard} disabled={isCopping}>
            <Text style={styles.discord}>
              {isCopping ? <ActivityIndicator color={THEME.COLORS.PRIMARY}/> : discord}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}