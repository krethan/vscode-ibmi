import IBMi from "../api/IBMi";
import { GetNewLibl } from "./getNewLibl";
import { SqlToCsv } from "./sqlToCsv";

export enum ComponentState {
  NotChecked = `NotChecked`,
  NotInstalled = `NotInstalled`,
  Installed = `Installed`,
  Error = `Error`,
}
interface ComponentRegistry {
  GetNewLibl?: GetNewLibl;
  SqlToCsv?: SqlToCsv;
}

export type ComponentId = keyof ComponentRegistry;

export class ComponentManager {
  private registered: ComponentRegistry = {};

  public async startup(connection: IBMi) {
    this.registered.GetNewLibl = new GetNewLibl(connection);
    await this.registered.GetNewLibl.checkState();

    this.registered.SqlToCsv = new SqlToCsv(connection);
    await this.registered.SqlToCsv.checkState();
  }

  // TODO: return type based on ComponentIds
  get<T>(id: ComponentId): T|undefined {
    const component = this.registered[id];
    if (component && component.getState() === ComponentState.Installed) {
      return component as T;
    }
  }
}

export abstract class ComponentT {
  public state: ComponentState = ComponentState.NotChecked;
  public currentVersion: number = 0;

  constructor(public connection: IBMi) { }

  abstract getInstalledVersion(): Promise<number | undefined>;
  abstract checkState(): Promise<boolean>
  abstract getState(): ComponentState;
}