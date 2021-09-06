import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { NativeRouter, Route } from 'react-router-native';
import {
  getDBConnection,
  getFromTable,
  saveRecipes,
  createTable,
} from './src/Utilities/db.js';

import FooterNav from './src/components/FooterNav';
import Home from './src/screens/Home';
import Filter from './src/screens/Filter';
import Results from './src/screens/Results';
import Recipe from './src/screens/Recipe';
import Favorites from './src/screens/Favorites';

import curatedRecipes from './src/data/recipesComplete.json';
import ingredients from './src/data/ingredientsWithNutrition.json';
import imageMap from './src/Utilities/imageMap.js';

const App = ({ history }) => {
  const [userState, setUserState] = useState({
    recipeResults: [],
    curatedRecipes: curatedRecipes.map((recipe, index) => {
      recipe.image = imageMap[recipe.img];
      recipe.id = index;
      return recipe;
    }),
    ingredients: ingredients,
    selectedRecipe: null,
    searchMain: '',
    searchCategoryFilter: [],
    searchIngredientIncludeFilter: [],
    searchIngredientExcludeFilter: [],
    searchDietaryOptionsFilter: [],
  });

  const updateState = useCallback(
    async (key, updatedValue) => {
      const updatedState = userState;
      updatedState[key] = updatedValue;
      setUserState(updatedState);
      if (key === 'curatedRecipes') {
        try {
          const db = await getDBConnection();
          await saveRecipes(db, userState.curatedRecipes, 'curatedRecipes');
        } catch (error) {
          console.error(error);
        }
      }
    },
    [userState],
  );

  const loadDataCallback = useCallback(async () => {
    try {
      const db = await getDBConnection();
      await createTable(db, 'curatedRecipes');
      const storedRecipes = await getFromTable(db, 'curatedRecipes');
      storedRecipes.length
        ? updateState('curatedRecipes', storedRecipes)
        : await saveRecipes(db, userState.curatedRecipes, 'curatedRecipes');
    } catch (error) {
      console.error(error);
    }
  }, [updateState, userState.curatedRecipes]);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  return (
    <View style={styles.container}>
      <Image
        source={require('./src/images/UI/LogoGroup.png')}
        style={styles.logo}
      />
      <NativeRouter>
        <Route
          exact
          path="/"
          render={props => (
            <Home {...props} updateState={updateState} userState={userState} />
          )}
        />
        <Route
          exact
          path="/filter"
          render={props => (
            <Filter
              {...props}
              updateState={updateState}
              userState={userState}
            />
          )}
        />
        <Route
          exact
          path="/results"
          render={props => (
            <Results
              {...props}
              updateState={updateState}
              userState={userState}
            />
          )}
        />
        <Route
          exact
          path="/recipe"
          render={props => (
            <Recipe
              {...props}
              updateState={updateState}
              userState={userState}
            />
          )}
        />
        <Route
          exact
          path="/favorites"
          render={props => (
            <Favorites
              {...props}
              updateState={updateState}
              userState={userState}
            />
          )}
        />
        <FooterNav goHome={() => history.push('/results')} />
      </NativeRouter>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
    justifyContent: 'space-between',
  },
  logo: {
    margin: 'auto',
    padding: 0,
    alignSelf: 'center',
  },
});

export default App;
