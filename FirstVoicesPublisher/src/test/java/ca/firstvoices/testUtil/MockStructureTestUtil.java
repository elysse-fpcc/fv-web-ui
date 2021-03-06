/*
 *
 *  *
 *  * Copyright 2020 First People's Cultural Council
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *  * /
 *
 */

package ca.firstvoices.testUtil;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.DocumentRef;
import org.nuxeo.ecm.core.api.PathRef;

public class MockStructureTestUtil {

  public static final String SCHEMA_PUBLISHING = "publishing";
  public static final String SECTIONS_PROPERTY_NAME = "publish:sections";
  private static int numMapsInTestList = 4;
  private String[] words = {"ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
      "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN"};
  private DocumentModel word;
  private DocumentModel dialectDoc;
  private DocumentModel[] wordArray = null;

  public DocumentModel getCurrentDialect() {
    return dialectDoc;
  }

  private void recursiveRemove(CoreSession session, DocumentModel parent) {
    DocumentModelList children = session.getChildren(parent.getRef());

    for (DocumentModel child : children) {
      recursiveRemove(session, child);
    }

    session.removeDocument(parent.getRef());
    session.save();
  }

  private void startFresh(CoreSession session) {
    DocumentRef dRef = new PathRef("/FV");
    DocumentModel defaultDomain = session.getDocument(dRef);

    DocumentModelList children = session.getChildren(defaultDomain.getRef());

    for (DocumentModel child : children) {
      recursiveRemove(session, child);
    }
  }

  public DocumentModel[] getTestWordsArray(CoreSession session) {
    DocumentModelList testWords = session.query("SELECT * FROM FVWord WHERE ecm:isVersion = 0");
    assertNotNull("Should always have valid list of FVWords", testWords);
    DocumentModel[] docArray = new DocumentModel[testWords.size()];
    int i = 0;

    for (DocumentModel doc : testWords) {
      docArray[i] = doc;
      i++;
    }
    // keep converted array for later
    wordArray = docArray;

    return docArray;
  }


  public void publishWords(CoreSession session) {
    IntStream.range(0, wordArray.length).forEach(i -> assertTrue("Should succesfully publish word",
        session.followTransition(wordArray[i], "Publish")));
  }

  public void createSetup(CoreSession session) {
    startFresh(session);

    DocumentModel domain = createDocument(session,
        session.createDocumentModel("/", "FV", "Domain"));

    createDialectTree(session);

    createWords(session);

    session.save();

    wordArray = getTestWordsArray(session);

    assertNotNull("Should have a valid word array(1)", wordArray);
    publishWords(session);
    session.save();
  }

  public DocumentModel createDialectTree(CoreSession session) {
    assertNotNull("Should have a valid Domain",
        createDocument(session, session.createDocumentModel("/", "FV", "Domain")));
    assertNotNull("Should have a valid Workspace",
        createDocument(session, session.createDocumentModel("/FV", "Workspaces", "WorkspaceRoot")));
    assertNotNull("Should have a valid FVLanguageFamily", createDocument(session,
        session.createDocumentModel("/FV/Workspaces", "Family", "FVLanguageFamily")));
    assertNotNull("Should have a valid FVLanguage", createDocument(session,
        session.createDocumentModel("/FV/Workspaces/Family", "Language", "FVLanguage")));
    dialectDoc = createDocument(session,
        session.createDocumentModel("/FV/Workspaces/Family/Language", "Dialect", "FVDialect"));
    assertNotNull("Should have a valid FVDialect", dialectDoc);
    session.save();

    return dialectDoc;
  }

  public DocumentModel createDocument(CoreSession session, DocumentModel model) {
    model.setPropertyValue("dc:title", model.getName());
    DocumentModel newDoc = session.createDocument(model);
    session.save();

    return newDoc;
  }

  public void createWords(CoreSession session) {
    Integer i = 0;

    for (String wordValue : words) {
      word = session
          .createDocumentModel("/FV/Workspaces/Language/Dialect/Dictionary", wordValue, "FVWord");
      session.save();
      assertNotNull("Should have a valid FVWord model", word);
      word.setPropertyValue("dc:title", wordValue);
      word.setPropertyValue("fv:reference", wordValue);
      word = createDocument(session, word);
      assertNotNull("Should have a valid FVWord", word);
      i++;
    }
  }

  /*
      Helper method to set a publication target for a document.
   */
  private void addSection(String targetSectionId, DocumentModel sourceDocument,
      CoreSession session) {

    if (targetSectionId != null && sourceDocument.hasSchema(SCHEMA_PUBLISHING)) {
      String[] sectionIdsArray = (String[]) sourceDocument.getPropertyValue(SECTIONS_PROPERTY_NAME);

      List<String> sectionIdsList = new ArrayList<String>();

      if (sectionIdsArray != null && sectionIdsArray.length > 0) {
        sectionIdsList = Arrays.asList(sectionIdsArray);
        // make it resizable
        sectionIdsList = new ArrayList<String>(sectionIdsList);
      }

      sectionIdsList.add(targetSectionId);
      String[] sectionIdsListIn = new String[sectionIdsList.size()];
      sectionIdsList.toArray(sectionIdsListIn);

      sourceDocument.setPropertyValue(SECTIONS_PROPERTY_NAME, sectionIdsListIn);
      session.saveDocument(sourceDocument);
      session.save();
    }
  }

}
