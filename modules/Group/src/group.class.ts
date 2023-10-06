import { BaseModule } from "@/modules/base.module";
import { IGroup } from "./types/group.type";
import * as GroupAPI from "./api/group.api";

export class Group extends BaseModule<IGroup, never> {
  async deleteGroup() {
    await GroupAPI.deleteGroup({ resourceName: this.get("resourceName") });
  }

  async addContacts(contactResourceNames: string[]) {
    await GroupAPI.updateContactsInGroup(this.get("resourceName"), {
      resourceNamesToAdd: contactResourceNames,
    });
  }

  async removeContacts(contactResourceNames: string[]) {
    await GroupAPI.updateContactsInGroup(this.get("resourceName"), {
      resourceNamesToRemove: contactResourceNames,
    });
  }

  static async getGroupDetails(resourceName: string) {
    const resp = await GroupAPI.getGroupDetails({ resourceName });

    return new Group(resp);
  }

  static async getCustomGroups() {
    const resp = await GroupAPI.getCustomGroups();

    return {
      ...resp,
      results: resp.results.map((item) => new Group(item)),
    };
  }

  static async createGroup(data: Pick<IGroup, "name">) {
    const resp = await GroupAPI.createGroup(data);

    return new Group(resp);
  }
}
