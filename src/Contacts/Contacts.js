import React, { Component } from 'react';
import { Container, Content, List, ListItem, Thumbnail, Text } from 'native-base';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

export default class Contacts extends Component {


  render() {
    return (     
            <Container style={[styles.container]}>
                <Content style={[styles.container]}>
                    <List style={[styles.container]}>
                        <ListItem style={[styles.container]}>
                            <Text>Simon Mignolet</Text>
                        </ListItem>
                        <ListItem>
                            <Text>Nathaniel Clyne</Text>
                        </ListItem>
                        <ListItem>
                            <Text>Dejan Lovren</Text>
                        </ListItem>
                    </List>
                </Content>
            </Container>     
    );
  }
}