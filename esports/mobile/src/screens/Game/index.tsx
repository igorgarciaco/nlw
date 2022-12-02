import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Image, FlatList, Text} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Entypo } from '@expo/vector-icons';

import logoImg from '../../assets/logo-nlw-esports.png'

import { styles } from './styles'
import { THEME } from '../../theme'

import { Background } from '../../components/Background'
import { GameParams } from '../../@types/navigation'
import { Heading } from '../../components/Heading'
import { DuoCard, DuoCardProps } from '../../components/DuoCard';
import { DuoMatch } from '../../components/DuoMatch'

export function Game() {
  const route = useRoute();
  const game = route.params as GameParams

  const navigation = useNavigation();

  function handleGoBack() {
    navigation.goBack();
  }

  const [duos, setDuos] = useState<DuoCardProps[]>([])
  const [discordDuoSelected, setDiscordDuoSelected] = useState('')

  async function getDiscordUser(adsId: string) {
    fetch(`http://192.168.3.4:3333/ads/${adsId}/discord`)
    .then(response => response.json())
    .then(data => setDiscordDuoSelected(data.discord))
  }

  useEffect(() => {
    fetch(`http://192.168.3.4:3333/games/${game.id}/ads`)
      .then(response => response.json())
      .then(data => setDuos(data))
  }, []);

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Entypo
              name="chevron-thin-left"
              color={THEME.COLORS.CAPTION_300}
              size={20}
            />
          </TouchableOpacity>

          <Image
            source={logoImg}
            style={styles.logo}
          />
          <View style={styles.right} />
        </View>
          <Image
            source={{ uri: game.bannerUrl }}
            style={styles.cover}
            resizeMode="contain"
          />
        <Heading title={game.title} subtitle="Conecte-se e comece a jogar!" />

        <FlatList
          data={duos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DuoCard data={item} onConnect={() => getDiscordUser(item.id)} />

          )}
          horizontal
          style={styles.containerList}
          contentContainerStyle={[duos.length > 1 ? styles.contentList : styles.emptyListContent]}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={styles.emptyListText}>
              Não há anúncios ainda.
            </Text>
          )}
        />

        <DuoMatch 
          visible={discordDuoSelected.length > 0}
          discord={discordDuoSelected}
          onClose={() =>  setDiscordDuoSelected('')}
        />
      </SafeAreaView>
    </Background>
  );
}

function setGames(data: any): any {
  throw new Error('Function not implemented.');
}