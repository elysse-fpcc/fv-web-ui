// NOTE: this file will be copied to `cypress/integration` and run from there,
// so imports paths will be based on that location!
import 'cypress-testing-library/add-commands'
import testSearch from '../../../app/assets/javascripts/views/components/SearchDialect/__cypress__/common/testSearch.js'
import testSearchWords from '../../../app/assets/javascripts/views/components/SearchDialect/__cypress__/common/testSearchWords.js'

describe('SearchDialect-Words-Private.js > SearchDialect', () => {
  it('Should redirect with anon user, no redirect with member', () => {
    cy.log('Trying to access private section with anon user')
    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageSix/learn/words')
    cy.wait(500)
    cy.location('pathname').should('eq', '/explore/FV/sections/Data/Test/Test/TestLanguageSix/learn/words')
    cy.log('Trying to access private section with registered user')
    cy.login({
      userName: 'TESTLANGUAGESIX_ADMIN',
    })
    cy.visit('/explore/FV/Workspaces/Data/Test/Test/TestLanguageSix/learn/words')
    cy.wait(500)
    cy.location('pathname').should('eq', '/explore/FV/Workspaces/Data/Test/Test/TestLanguageSix/learn/words')

    testSearch()
    testSearchWords()
  })
})
