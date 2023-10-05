import { BaseModule } from "@/modules/base.module";
import { IGroup } from "./types/group.type";
import * as GroupAPI from "./api/group.api";

export class Group extends BaseModule<IGroup, never> {
  async deleteGroup() {
    await GroupAPI.deleteGroup({ resourceName: this.get("resourceName") });
  }

  async addContact(contactResourceName: string) {
    await GroupAPI.updateContactsInGroup(this.get("resourceName"), {
      resourceNamesToAdd: [contactResourceName],
    });
  }

  async removeContact(contactResourceName: string) {
    await GroupAPI.updateContactsInGroup(this.get("resourceName"), {
      resourceNamesToRemove: [contactResourceName],
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
