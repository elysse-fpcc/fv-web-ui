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

package ca.firstvoices.utils;

import static ca.firstvoices.utils.FVRegistrationConstants.EMAIL_EXISTS_ERROR;
import static ca.firstvoices.utils.FVRegistrationConstants.GROUP_NAME_ARG;
import static ca.firstvoices.utils.FVRegistrationConstants.LOGIN_AND_EMAIL_EXIST_ERROR;
import static ca.firstvoices.utils.FVRegistrationConstants.LOGIN_EXISTS_ERROR;
import static ca.firstvoices.utils.FVRegistrationConstants.NEW_MEMBER_SELF_REGISTRATION_ACT;
import static ca.firstvoices.utils.FVRegistrationConstants.NEW_TEAM_MEMBER_SELF_REGISTRATION_ACT;
import static ca.firstvoices.utils.FVRegistrationConstants.REGISTRATION_CAN_PROCEED;
import static ca.firstvoices.utils.FVRegistrationConstants.REGISTRATION_EXISTS_ERROR;
import static ca.firstvoices.utils.FVRegistrationConstants.SYSTEM_APPROVED_GROUP_CHANGE;
import static ca.firstvoices.utils.FVRegistrationConstants.USER_NAME_ARG;

import ca.firstvoices.user.FVUserRegistrationInfo;
import java.io.Serializable;
import java.time.Year;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.automation.AutomationService;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.core.util.StringList;
import org.nuxeo.ecm.automation.server.jaxrs.RestOperationException;
import org.nuxeo.ecm.core.api.CoreInstance;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.DocumentRef;
import org.nuxeo.ecm.core.api.IdRef;
import org.nuxeo.ecm.core.api.NuxeoException;
import org.nuxeo.ecm.core.api.NuxeoGroup;
import org.nuxeo.ecm.core.api.NuxeoPrincipal;
import org.nuxeo.ecm.core.api.UnrestrictedSessionRunner;
import org.nuxeo.ecm.core.api.security.ACE;
import org.nuxeo.ecm.core.api.security.ACL;
import org.nuxeo.ecm.core.api.security.ACP;
import org.nuxeo.ecm.core.api.security.SecurityConstants;
import org.nuxeo.ecm.core.event.Event;
import org.nuxeo.ecm.core.event.EventProducer;
import org.nuxeo.ecm.core.event.impl.DocumentEventContext;
import org.nuxeo.ecm.platform.usermanager.UserManager;
import org.nuxeo.ecm.user.invite.UserInvitationComponent;
import org.nuxeo.ecm.user.invite.UserInvitationService.ValidationMethod;
import org.nuxeo.ecm.user.invite.UserRegistrationException;
import org.nuxeo.ecm.user.registration.DocumentRegistrationInfo;
import org.nuxeo.ecm.user.registration.UserRegistrationService;
import org.nuxeo.runtime.api.Framework;

public class FVRegistrationUtilities {

  private static final Log log = LogFactory.getLog(FVRegistrationUtilities.class);

  private DocumentRegistrationInfo docInfo;

  private FVUserRegistrationInfo userInfo;

  private String requestedSpaceId;

  private String dialectTitle;

  private UnrestrictedGroupResolver ugdr;

  private DocumentModel dialect;

  private UserManager userManager;

  private FVRegistrationMailUtilities mailUtil = new FVRegistrationMailUtilities();
  private OperationContext ctx;

  /**
   * @param sl
   * @return
   */
  public static ArrayList<String> makeArrayFromStringList(StringList sl) {
    if (sl == null) {
      return null;
    }

    ArrayList<String> al = new ArrayList<>();
    for (String s : sl) {
      al.add(s);
    }

    return al;
  }

  /**
   * @param dateRegistered
   * @return
   */
  public static long calculateRegistrationAgeInDays(Calendar dateRegistered) {
    //
    // long diffSeconds = diff / 1000 % 60;
    // long diffMinutes = diff / (60 * 1000) % 60;
    // long diffHours = diff / (60 * 60 * 1000) % 24;
    // long diffDays = diff / (24 * 60 * 60 * 1000);
    // total minutes between periods
    // long diffMinutes = timeDiff / (60 * 1000) % 60 + 60*(( timeDiff / (60 * 60 * 1000) % 24)
    // + (timeDiff / (24 *
    // 60 * 60 * 1000)) * 24)
    // minutes are used for testing ONLY

    long timeDiff = Calendar.getInstance().getTimeInMillis() - dateRegistered.getTimeInMillis();
    long diffDays = timeDiff / (24 * 60 * 60 * 1000);

    return diffDays;
  }

  // provide hrs within the day since registration started
  public static long calculateRegistrationModHours(Calendar dateRegistered) {
    long timeDiff = Calendar.getInstance().getTimeInMillis() - dateRegistered.getTimeInMillis();
    long diffHours = (timeDiff / (60 * 60 * 1000)) % 24;
    return diffHours;
  }

  /**
   * Removes registration request for users
   *
   * @param users list of users to remove registration requests for
   */
  public static void removeRegistrationsForUsers(CoreSession session, StringList users) {
    DocumentModelList docs = getRegistrations(session, users);

    for (DocumentModel doc : docs) {
      session.removeDocument(doc.getRef());
    }
  }

  /**
   * Get registration for a list of users
   *
   * @param users list of users to lookup registration for
   */
  public static DocumentModelList getRegistrations(CoreSession session, StringList users) {
    String query = String.format(
        "SELECT * FROM FVUserRegistration " + "WHERE userinfo:email IN ('%s') "
            + "ORDER BY dc:created DESC", String.join("','", users));

    DocumentModelList docs = session.query(query);

    return docs;
  }

  /**
   * Get registration for single user, for a dialect
   *
   * @param user    user to lookup registration for
   * @param dialect dialect user requested to join
   */
  public static DocumentModelList getRegistrations(CoreSession session, String user,
      String dialect) {
    String query = String.format(
        "SELECT * FROM FVUserRegistration " + "WHERE userinfo:email LIKE '%s' "
            + "AND fvuserinfo:requestedSpace = '%s' " + "ORDER BY dc:created DESC", user, dialect);

    DocumentModelList docs = session.query(query);

    return docs;
  }

  public DocumentModel getDialect() {
    return dialect;
  }

  public String getDialectTitle() {
    return dialectTitle;
  }

  public FVUserRegistrationInfo getUserInfo() {
    return userInfo;
  }

  public DocumentRegistrationInfo getDocInfo() {
    return docInfo;
  }

  /**
   * @param registrationRequest
   * @param session
   * @param userManager1
   */
  public void registrationCommonSetup(DocumentModel registrationRequest, CoreSession session,
      UserManager userManager1) {
    userManager = userManager1;

    requestedSpaceId = (String) registrationRequest.getPropertyValue("fvuserinfo:requestedSpace");

    if (requestedSpaceId == null) {
      throw new UserRegistrationException("You must specify a dialect to join.");
    }

    // Source lookup (unrestricted)
    UnrestrictedSourceDocumentResolver usdr = new UnrestrictedSourceDocumentResolver(session,
        requestedSpaceId);
    usdr.runUnrestricted();

    // Source document, should be detached if we read properties on it at this point
    dialect = usdr.dialect;

    if (dialect.getCurrentLifeCycleState().equals("disabled")) {
      throw new UserRegistrationException("Cannot request to join a disabled dialect.");
    }

    // Set Workspace document as requested space
    registrationRequest.setPropertyValue("fvuserinfo:requestedSpace", dialect.getId());

    userInfo = new FVUserRegistrationInfo();

    String ageGroup = (String) registrationRequest.getPropertyValue("fvuserinfo:ageGroup");

    if (ageGroup != null) {
      int today = Year.now().getValue();

      if (ageGroup.contains("100+")) {

        ageGroup = String.valueOf(today - 101);
      } else {
        String[] tokens = ageGroup.split("-");
        if (tokens.length == 2) {
          int lage = Integer.valueOf(tokens[0]);
          int uage = Integer.valueOf(tokens[1]);

          int blage = today - lage;
          int buage = today - uage;
          ageGroup = buage + "-" + blage;
        }
      }
    }

    userInfo.setRequestedSpace(dialect.getId());
    userInfo.setAgeGroup(ageGroup);
    userInfo.setRole((String) registrationRequest.getPropertyValue("fvuserinfo:role"));
    userInfo.setEmail((String) registrationRequest.getPropertyValue("userinfo:email"));
    userInfo.setFirstName((String) registrationRequest.getPropertyValue("userinfo:firstName"));
    userInfo.setLastName((String) registrationRequest.getPropertyValue("userinfo:lastName"));
    userInfo.setComment((String) registrationRequest.getPropertyValue("fvuserinfo:comment"));
    userInfo.setCommunityMember(
        (Boolean) registrationRequest.getPropertyValue("fvuserinfo:community_member"));
    userInfo.setLanguageTeamMember(
        (Boolean) registrationRequest.getPropertyValue("fvuserinfo:language_team_member"));

    userInfo.setLogin(userInfo.getEmail());

    try {
      FVUserPreferencesSetup up = new FVUserPreferencesSetup();
      String defaultUserPrefs = up
          .createDefaultUserPreferencesWithRegistration(registrationRequest);
      userInfo.setPreferences(defaultUserPrefs);
    } catch (Exception e) {
      log.error(e);
    }

    docInfo = new DocumentRegistrationInfo();
    docInfo.setDocumentId(dialect.getId());
    docInfo.setDocumentTitle(dialect.getTitle());
  }

  /**
   * @param registrationRequest
   * @param session
   * @return
   */
  public void quickUserRegistrationCondition(DocumentModel registrationRequest,
      CoreSession session) {
    ugdr = new UnrestrictedGroupResolver(session, dialect);
    ugdr.runUnrestricted();

    ArrayList<String> preSetGroup;
    NuxeoGroup memberGroup = userManager.getGroup("members");

    if (memberGroup != null) {
      preSetGroup = new ArrayList();
      preSetGroup.add("members");
      userInfo.setGroups(preSetGroup);
    } else {
      if (!ugdr.memberGroups.isEmpty()) {
        userInfo.setGroups(ugdr.memberGroups);

        preSetGroup = (ArrayList<String>) registrationRequest.getPropertyValue("userinfo:groups");

        if (!preSetGroup.isEmpty()) {
          userInfo.setGroups(preSetGroup);
        }
      }
    }
  }

  /**
   * @throws Exception
   */
  private void notificationEmailsAndReminderTasks(DocumentModel dialect, DocumentModel ureg,
      int variant) throws Exception {
    Map<String, String> options = new HashMap<>();
    options.put("fName", (String) ureg.getPropertyValue("userinfo:firstName"));
    options.put("lName", (String) ureg.getPropertyValue("userinfo:lastName"));
    options.put("email", (String) ureg.getPropertyValue("userinfo:email"));
    options.put("comment", (String) ureg.getPropertyValue("fvuserinfo:comment"));
    options.put("dialectId", dialect.getId());
    options.put("dialect", dialect.getTitle());
    options.put("dialectState", dialect.getCurrentLifeCycleState());

    String adminTO = mailUtil.getLanguageAdministratorEmail(dialect);
    String superAdminBCC = mailUtil.getSuperAdministratorEmail();

    // If language does not have an administrator - send directly to super admin
    if (adminTO.isEmpty()) {
      adminTO = superAdminBCC;
    }

    mailUtil.registrationAdminMailSender(variant, options, adminTO, superAdminBCC);
  }

  /**
   * @param registrationRequest
   * @param session
   * @return
   */
  public boolean userInviteCondition(DocumentModel registrationRequest, CoreSession session) {
    boolean autoAccept;

    ugdr = new UnrestrictedGroupResolver(session, dialect);
    ugdr.runUnrestricted();

    // If no group found (somehow), add Read permission directly.
    if (!ugdr.memberGroups.isEmpty()) {
      userInfo.setGroups(ugdr.memberGroups);
    } else {
      docInfo.setPermission("Read");
    }

    // If authorized, use preset groups
    NuxeoPrincipal currentUser = session.getPrincipal();
    if (currentUser.isAdministrator() || currentUser
        .isMemberOf(CustomSecurityConstants.LANGUAGE_ADMINS_GROUP)) {
      autoAccept = true;

      @SuppressWarnings("unchecked") List<String> preSetGroup = (List<String>) registrationRequest
          .getPropertyValue("userinfo:groups");

      if (!preSetGroup.isEmpty()) {
        userInfo.setGroups(preSetGroup);
      }
    } else {
      // If not authorized, never autoAccept

      autoAccept = false;
    }

    return autoAccept;
  }

  /**
   * @param registrationService
   * @param registrationRequest
   * @param info
   * @param comment
   * @param validationMethod
   * @param autoAccept
   * @return
   */
  public String registrationCommonFinish(UserRegistrationService registrationService,
      DocumentModel registrationRequest, Map<String, Serializable> info, String comment,
      ValidationMethod validationMethod, boolean autoAccept, CoreSession session) throws Exception {
    int validationStatus;

    try {
      ctx = new OperationContext(session);
      Map<String, Object> params = new HashMap<>();
      params.put("Login:", userInfo.getEmail());
      params.put("email:", userInfo.getEmail());
      AutomationService automationService = Framework.getService(AutomationService.class);
      validationStatus = (int) automationService.run(ctx, "FVValidateRegistrationAttempt", params);
    } catch (Exception e) {
      log.warn("Exception while validating registration.");
      throw new Exception("Exception while invoking registration validation. " + e);
    } finally {
      ctx.close();
    }

    if (validationStatus != REGISTRATION_CAN_PROCEED) {
      switch (validationStatus) {
        case EMAIL_EXISTS_ERROR:
        case LOGIN_EXISTS_ERROR:
        case LOGIN_AND_EMAIL_EXIST_ERROR:
          throw new RestOperationException("This email address is already in use.", 400);

        case REGISTRATION_EXISTS_ERROR:
          throw new RestOperationException(
              "A pending registration with the same credentials is present. Please check your "
                  + "email (including SPAM folder) for a message with instructions or contact us"
                  + " for help.", 400);
        default:
          break;
      }
    }

    // Additional information from registration
    info.put("dc:title",
        userInfo.getFirstName() + " " + userInfo.getLastName() + " Wants to Join " + dialectTitle);
    info.put("fvuserinfo:role", userInfo.getRole());
    info.put("fvuserinfo:ageGroup", userInfo.getAgeGroup());
    info.put("fvuserinfo:preferences", userInfo.getPreferences());
    info.put("fvuserinfo:requestedSpace", userInfo.getRequestedSpace());
    info.put("fvuserinfo:comment", userInfo.getComment());
    info.put("fvuserinfo:language_team_member", userInfo.getLanguageTeamMember());
    info.put("fvuserinfo:community_member", userInfo.getCommunityMember());
    info.put(UserInvitationComponent.PARAM_ORIGINATING_USER, session.getPrincipal().getName());

    // Add status of dialect for email
    info.put("dialect_current_status", dialect.getCurrentLifeCycleState());

    // Set permissions on registration document
    String registrationId = null;

    registrationId = registrationService.submitRegistrationRequest(
        registrationService.getConfiguration(UserRegistrationService.CONFIGURATION_NAME).getName(),
        userInfo, docInfo, info, validationMethod, autoAccept, userInfo.getEmail());

    UnrestrictedRequestPermissionResolver urpr = new UnrestrictedRequestPermissionResolver(session,
        registrationId, ugdr.languageAdminGroup);
    urpr.runUnrestricted();

    return registrationId;
  }

  /**
   * @param uregRef
   */
  public void registrationValidationHandler(DocumentRef uregRef, CoreSession s) {
    UserManager userManager = Framework.getService(UserManager.class);

    CoreInstance.doPrivileged(s, session -> {

      DocumentModel ureg = session.getDocument(uregRef);
      dialect = session
          .getDocument(new IdRef((String) ureg.getPropertyValue("docinfo:documentId")));
      String dialectLifeCycleState = dialect.getCurrentLifeCycleState();

      String username = (String) ureg.getPropertyValue("userinfo:login");
      DocumentModel userDoc = userManager.getUserModel(username);

      try {
        // Set creation time
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date(System.currentTimeMillis()));

        // String defaultUserPrefs = up.createDefaultUserPreferencesWithRegistration( ureg );

        // Update user properties

        // If user requested access to a private (i.e. Enabled) dialect; do not set user
        // preferences
        // so that the user is not redirected to the private dialect and gets a 404.
        // Next step would be for Language Administrator to add them to a group directly.
        if (!dialectLifeCycleState.equals("Enabled")) {
          userDoc.setPropertyValue("user:preferences",
              ureg.getPropertyValue("fvuserinfo:preferences"));
        }

        userDoc
            .setPropertyValue("user:yearBornRange", ureg.getPropertyValue("fvuserinfo:ageGroup"));
        userDoc.setPropertyValue("user:role", ureg.getPropertyValue("fvuserinfo:role"));
        userDoc.setPropertyValue("user:ua", ureg.getPropertyValue("fvuserinfo:ua"));
        userDoc.setPropertyValue("user:ip", ureg.getPropertyValue("fvuserinfo:ip"));
        userDoc.setPropertyValue("user:referer", ureg.getPropertyValue("fvuserinfo:referer"));
        userDoc.setPropertyValue("user:created", calendar);
        userManager.updateUser(userDoc);

        // Add user to 'members' group
        String newUserGroup = "members";
        DocumentEventContext groupCtx = new DocumentEventContext(session, session.getPrincipal(),
            dialect);
        groupCtx.setProperty(USER_NAME_ARG, username);
        groupCtx.setProperty(GROUP_NAME_ARG, newUserGroup);
        Event event;
        event = groupCtx.newEvent(SYSTEM_APPROVED_GROUP_CHANGE);
        EventProducer eventProducer = Framework.getService(EventProducer.class);
        eventProducer.fireEvent(event);

        // Send appropriate email templates

        // User indicated they are a language team member
        if (ureg.getPropertyValue("fvuserinfo:language_team_member") != null && (boolean) ureg
            .getPropertyValue("fvuserinfo:language_team_member")) {
          notificationEmailsAndReminderTasks(dialect, ureg, NEW_TEAM_MEMBER_SELF_REGISTRATION_ACT);
        } else if (ureg.getPropertyValue("fvuserinfo:community_member") != null && (boolean) ureg
            .getPropertyValue("fvuserinfo:community_member")) {
          // User indicated they are a community team member
          notificationEmailsAndReminderTasks(dialect, ureg, NEW_MEMBER_SELF_REGISTRATION_ACT);
        }

        // Note: If user is neither, no email is send to administrators.

      } catch (Exception e) {
        log.error("Exception while updating user and completing registration " + e);
        throw new NuxeoException(e);
      }
    });
  }

  protected static class UnrestrictedSourceDocumentResolver extends UnrestrictedSessionRunner {

    // private final CoreSession session;
    private final String docid;

    public DocumentModel dialect;

    protected UnrestrictedSourceDocumentResolver(CoreSession session, String docId) {
      super(session);
      // this.session = session;
      docid = docId;
    }

    @Override
    public void run() {
      // Get requested space (dialect)
      dialect = session.getDocument(new IdRef(docid));

      if (dialect.isProxy()) {
        dialect = session.getSourceDocument(dialect.getRef());
      }
      dialect.detach(true);
    }
  }

  protected static class UnrestrictedGroupResolver extends UnrestrictedSessionRunner {

    // private final CoreSession session;
    private DocumentModel dialect;

    private ArrayList<String> memberGroups = new ArrayList<>();

    private String languageAdminGroup;

    protected UnrestrictedGroupResolver(CoreSession session, DocumentModel dialect) {
      super(session);
      // this.session = session;
      this.dialect = dialect;
    }

    @Override
    public void run() {
      DocumentModel dialect1 = session.getDocument(new IdRef(dialect.getId()));
      // Add user to relevant group
      for (ACE ace : dialect1.getACP().getACL(ACL.LOCAL_ACL).getACEs()) {

        String username = ace.getUsername();

        if (SecurityConstants.READ.equals(ace.getPermission())) {
          if (username.contains("_members") && ace.isGranted()) {
            memberGroups.add(username);
          }
        }

        if (SecurityConstants.EVERYTHING.equals(ace.getPermission()) && ace.isGranted()) {
          if (username.contains(CustomSecurityConstants.LANGUAGE_ADMINS_GROUP)) {
            languageAdminGroup = username;
          }
        }
      }
    }
  }

  protected static class UnrestrictedRequestPermissionResolver extends UnrestrictedSessionRunner {

    private String registrationDocId;

    private String languageAdminGroup;

    protected UnrestrictedRequestPermissionResolver(CoreSession session, String registrationDocId,
        String languageAdminGroup) {
      super(session);
      this.registrationDocId = registrationDocId;
      this.languageAdminGroup = languageAdminGroup;
    }

    @Override
    public void run() {
      DocumentModel registrationDoc = session.getDocument(new IdRef(registrationDocId));

      ACE registrationACE = new ACE(languageAdminGroup, SecurityConstants.EVERYTHING);
      ACE registrationContainerACE = new ACE(languageAdminGroup, SecurityConstants.REMOVE_CHILDREN);

      ACP registrationDocACP = registrationDoc.getACP();
      registrationDocACP.addACE("local", registrationACE);
      registrationDoc.setACP(registrationDocACP, false);

      // Apply REMOVE CHILD permission to parent so that registration requests can be removed.
      DocumentModel registrationContainer = session.getDocument(registrationDoc.getParentRef());
      ACP registrationContainerDocACP = registrationContainer.getACP();
      registrationContainerDocACP.addACE("local", registrationContainerACE);

      registrationContainer.setACP(registrationContainerDocACP, false);
    }
  }
}
